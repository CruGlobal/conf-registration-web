import angular, { IPromise } from 'angular';
import { ModalMessage, $rootScope, $http, $q, $route } from 'injectables';
import { PromotionReport } from 'promotionReport';
import { Registration } from 'registration';

export class PromoReportService {
  $rootScope: $rootScope;
  $route: $route;
  $http: $http;
  $q: $q;
  modalMessage: ModalMessage;

  constructor(
    $rootScope: $rootScope,
    $route: $route,
    $http: $http,
    $q: $q,
    modalMessage: ModalMessage,
  ) {
    this.$rootScope = $rootScope;
    this.$route = $route;
    this.$http = $http;
    this.$q = $q;
    this.modalMessage = modalMessage;
  }

  async loadAllPromoReports(
    conferenceId: string,
  ): Promise<Array<PromotionReport>> {
    this.$rootScope.loadingMsg = 'Loading Reports';

    try {
      const response = await this.$http.get<Array<PromotionReport>>(
        `conferences/${conferenceId}/promotion/reports`,
      );
      return response.data;
    } finally {
      this.$rootScope.loadingMsg = '';
    }
  }

  async loadPromoReport(reportUrl: string): Promise<PromotionReport> {
    this.$rootScope.loadingMsg = 'Loading Report';

    try {
      const response = await this.$http.get<PromotionReport>(reportUrl);
      return response.data;
    } finally {
      this.$rootScope.loadingMsg = '';
    }
  }

  // Returned promise resolves to null if the submission is still processing on the server, but the request timed out
  submitPromos(
    registrations: Array<Registration>,
  ): IPromise<PromotionReport | null> {
    this.$rootScope.loadingMsg = 'Submitting account transfers';
    return this.$http
      .post<string>('promotion/post', registrations)
      .then((response) => {
        const reportUrl = response.data;
        return this.loadPromoReport(reportUrl);
      })
      .finally(() => {
        this.$rootScope.loadingMsg = '';
      })
      .catch((errorResponse) => {
        const error = errorResponse?.data?.error;

        this.$rootScope.loadingMsg = '';
        this.modalMessage.error({
          title: error
            ? 'Error Submitting Account Transfers'
            : 'Promo Upload Delay',
          message: error
            ? errorResponse.data.error
            : '<p>Promo Upload process time varies by the size of the list submitted and your submission is taking longer than expected to process. The system is still working to complete your request.</p>' +
              '<br>' +
              '<p>The promotions submitted in this report will still be listed on the "New Report" promotions list until this submission is complete. Please DO NOT submit the same promotions again while waiting or charges will be duplicated.</p>' +
              '<br>' +
              '<p>Check back in a few minutes to see if your submitted report is in the dropdown box beside "Report Creation Date." Once your submitted report shows up in the dropdown box all completed promotions will no longer be listed in the "New Report" promotions list.</p>',
        });
        this.$route.reload();

        if (error) {
          throw error;
        } else {
          // A timeout from a long submission isn't actually an error, so just return null
          return null;
        }
      });
  }
}

angular
  .module('confRegistrationWebApp')
  .service('promoReportService', PromoReportService);
