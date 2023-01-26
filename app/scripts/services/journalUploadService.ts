import angular from 'angular';
import { omit } from 'lodash';
import { AccountTransfer } from 'accountTransfer';
import {
  ModalMessage,
  $rootScope,
  $http,
  $route,
  RegistrationQueryParams,
} from 'injectables';
import { JournalReport } from 'journalReport';
import { RegistrationsData } from 'registrations';

export class JournalUploadService {
  $http: $http;
  $rootScope: $rootScope;
  $route: $route;
  modalMessage: ModalMessage;

  constructor(
    $http: $http,
    $rootScope: $rootScope,
    $route: $route,
    modalMessage: ModalMessage,
  ) {
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.$route = $route;
    this.modalMessage = modalMessage;
  }

  async getRegistrationData(
    conferenceId: string,
    queryParameters: Partial<RegistrationQueryParams>,
  ): Promise<RegistrationsData> {
    this.$rootScope.loadingMsg = 'Loading Registrations';

    try {
      const response = await this.$http.get<RegistrationsData>(
        `conferences/${conferenceId}/registrations`,
        {
          params: {
            page: 1,
            limit: 20,
            orderBy: 'last_name',
            order: 'ASC',
            filter: '',
            filterAccountTransferErrors: 'yes',
            filterAccountTransfersByExpenseType: '',
            filterAccountTransfersByPaymentType: '',
            filterPayment: '',
            filterRegType: '',
            includeAccountTransfers: true,
            includeCheckedin: 'yes',
            includeWithdrawn: 'yes',
            includeIncomplete: 'yes',
            primaryRegistrantOnly: true,
            includePromotions: true,
            ...queryParameters,
          },
        },
      );
      return response.data;
    } finally {
      this.$rootScope.loadingMsg = '';
    }
  }

  // Load all account transfer reports from the server
  async loadAllAccountTransferReports(
    conferenceId: string,
  ): Promise<Array<JournalReport>> {
    this.$rootScope.loadingMsg = 'Loading Reports';

    try {
      const response = await this.$http.get<Array<JournalReport>>(
        `conferences/${conferenceId}/account/transfer/reports`,
      );
      return response.data;
    } finally {
      this.$rootScope.loadingMsg = '';
    }
  }

  // Load a single account transfer report from the server given its id
  loadAccountTransferReport(
    conferenceId: string,
    reportId: string,
  ): Promise<JournalReport> {
    return this.loadAccountTransferReportFromUrl(
      `conferences/${conferenceId}/promotion/report/${reportId}`,
    );
  }

  // Load a single account transfer report from the server given its URL
  async loadAccountTransferReportFromUrl(
    reportUrl: string,
  ): Promise<JournalReport> {
    this.$rootScope.loadingMsg = 'Loading Report';

    try {
      const response = await this.$http.get<JournalReport>(reportUrl);
      return response.data;
    } finally {
      this.$rootScope.loadingMsg = '';
    }
  }

  // Returned promise resolves to null if the submission is still processing on the server, but the request timed out
  async submitAccountTransfers(
    accountTransfers: Array<AccountTransfer>,
  ): Promise<JournalReport | null> {
    this.$rootScope.loadingMsg = 'Submitting account transfers';
    // Filter out included key from account transfer object
    const filteredAccountTransfers = accountTransfers.map((accountTransfer) =>
      omit(accountTransfer, ['included']),
    );
    try {
      const response = await this.$http.post<string>(
        'account/transfers',
        filteredAccountTransfers,
      );
      const reportUrl = response.data;
      return this.loadAccountTransferReportFromUrl(reportUrl);
    } catch (errorResponse: any) {
      const error = errorResponse.data?.error;

      this.$rootScope.loadingMsg = '';
      this.modalMessage.error({
        title: error
          ? 'Error Submitting Account Transfers'
          : 'Journal Upload Delay',
        message:
          error ??
          '<p>Journal Upload process time varies by the size of the list submitted and your submission is taking longer than expected to process. The system is still working to complete your request.</p>' +
            '<br>' +
            '<p>The transactions submitted in this Journal will still be listed on the "New Report" transactions list until this submission is complete. Please DO NOT submit the same transactions again while waiting or charges will be duplicated.</p>' +
            '<br>' +
            '<p>Check back in a few minutes to see if your submitted report is in the dropdown box beside "Report Creation Date." Once your submitted report shows up in the dropdown box all completed transactions will no longer be listed in the "New Report" transactions list.</p>',
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
  .service('journalUploadService', JournalUploadService);
