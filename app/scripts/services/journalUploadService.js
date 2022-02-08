angular
  .module('confRegistrationWebApp')
  .service(
    'journalUploadService',
    function JournalUploadService($rootScope, $route, $http, $q, modalMessage) {
      const path = function (id) {
        return `conferences/${id}`;
      };

      this.getRegistrationData = (
        conferenceId,
        queryParameters = {
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
        },
      ) => {
        $rootScope.loadingMsg = 'Loading Registrations';

        return $http
          .get(`${path(conferenceId)}/registrations`, {
            params: queryParameters,
          })
          .then((response) => {
            $rootScope.loadingMsg = '';
            return response.data;
          })
          .catch((err) => {
            $rootScope.loadingMsg = '';
            throw err;
          });
      };

      this.getAllAccountTransferReports = (conferenceId) => {
        $rootScope.loadingMsg = 'Loading Reports';

        return $http
          .get(`${path(conferenceId)}/account/transfer/reports`)
          .then((response) => {
            $rootScope.loadingMsg = '';
            return response.data;
          })
          .catch((err) => {
            $rootScope.loadingMsg = '';
            throw err;
          });
      };

      this.getAccountTransferReport = (url) => {
        $rootScope.loadingMsg = 'Loading Report';

        return $http
          .get(url)
          .then((response) => {
            $rootScope.loadingMsg = '';
            return response.data;
          })
          .catch((err) => {
            $rootScope.loadingMsg = '';
            throw err;
          });
      };

      this.getAccountTransferData = (data) => {
        return data.registrations.reduce((result, registrant) => {
          return [
            ...result,
            ...registrant.accountTransfers.filter(
              (accountTransfer) => !accountTransfer.error,
            ),
          ];
        }, []);
      };

      this.getAccountTransferDataWithErrors = (data) => {
        return data.registrations.reduce((result, registrant) => {
          return [
            ...result,
            ...registrant.accountTransfers.filter(
              (accountTransfer) => accountTransfer.error,
            ),
          ];
        }, []);
      };

      this.submitAccountTransfers = (accountTransfers) => {
        $rootScope.loadingMsg = 'Submitting account transfers';
        // Filter out included key from account transfer object
        const filteredAccountTransfers = accountTransfers.map(
          (accountTransfer) => {
            return Object.keys(accountTransfer)
              .filter((key) => key !== 'included')
              .reduce((obj, key) => {
                obj[key] = accountTransfer[key];
                return obj;
              }, {});
          },
        );
        return $http
          .post('account/transfers', filteredAccountTransfers)
          .then((response) => this.getAccountTransferReport(response.data))
          .finally(() => {
            $rootScope.loadingMsg = '';
          })
          .catch((errorResponse) => {
            $rootScope.loadingMsg = '';
            modalMessage.error({
              title:
                errorResponse.data && errorResponse.data.error
                  ? 'Error Submitting Account Transfers'
                  : 'Journal Upload Delay',
              message:
                errorResponse.data && errorResponse.data.error
                  ? errorResponse.data.error
                  : '<p>Journal Upload process time varies by the size of the list submitted and your submission is taking longer than expected to process. The system is still working to complete your request.</p>' +
                    '<br>' +
                    '<p>The transactions submitted in this Journal will still be listed on the "New Report" transactions list until this submission is complete. Please DO NOT submit the same transactions again while waiting or charges will be duplicated.</p>' +
                    '<br>' +
                    '<p>Check back in a few minutes to see if your submitted report is in the dropdown box beside "Report Creation Date." Once your submitted report shows up in the dropdown box all completed transactions will no longer be listed in the "New Report" transactions list.</p>',
            });
            $route.reload();
          });
      };
    },
  );
