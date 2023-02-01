import angular from 'angular';
import { ModalMessage, $RootScope, $Http, $Route } from 'injectables';
import { PromotionReport } from 'promotionReport';
import { Registration } from 'registration';

export class PromoReportService {
  $rootScope: $RootScope;
  $route: $Route;
  $http: $Http;
  modalMessage: ModalMessage;

  constructor(
    $rootScope: $RootScope,
    $route: $Route,
    $http: $Http,
    modalMessage: ModalMessage,
  ) {
    this.$rootScope = $rootScope;
    this.$route = $route;
    this.$http = $http;
    this.modalMessage = modalMessage;
  }

  // Load all promo reports from the server
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
      this.$rootScope.$apply(() => {
        this.$rootScope.loadingMsg = '';
      });
    }
  }

  // Load a single promo report from the server given its id
  loadPromoReport(
    conferenceId: string,
    reportId: string,
  ): Promise<PromotionReport> {
    return this.loadPromoReportFromUrl(
      `conferences/${conferenceId}/promotion/report/${reportId}`,
    );
  }

  // Load a single promo report from the server given its URL
  async loadPromoReportFromUrl(reportUrl: string): Promise<PromotionReport> {
    this.$rootScope.loadingMsg = 'Loading Report';

    try {
      const response = await this.$http.get<PromotionReport>(reportUrl);
      return response.data;
    } finally {
      this.$rootScope.$apply(() => {
        this.$rootScope.loadingMsg = '';
      });
    }
  }

  // Returned promise resolves to null if the submission is still processing on the server, but the request timed out
  async submitPromos(
    registrations: Array<Registration>,
  ): Promise<PromotionReport | null> {
    this.$rootScope.loadingMsg = 'Submitting promo reports';
    try {
      const response = await this.$http.post<string>(
        'promotion/post',
        registrations,
      );
      const reportUrl = response.data;
      return this.loadPromoReportFromUrl(reportUrl);
    } catch (errorResponse: any) {
      const error = errorResponse?.data?.error;

      this.$rootScope.loadingMsg = '';
      this.modalMessage.error({
        title: error ? 'Error Submitting Promo Report' : 'Promo Upload Delay',
        message:
          error ??
          '<p>Promo Upload process time varies by the size of the list submitted and your submission is taking longer than expected to process. The system is still working to complete your request.</p>' +
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
    } finally {
      this.$rootScope.$apply(() => {
        this.$rootScope.loadingMsg = '';
      });
    }
  }
}

angular
  .module('confRegistrationWebApp')
  .service('promoReportService', PromoReportService);
