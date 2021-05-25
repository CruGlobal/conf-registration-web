angular
  .module('confRegistrationWebApp')
  .service('journalUploadService', function JournalUploadService(
    $rootScope,
    $http,
    $q,
    modalMessage,
  ) {
    const path = function(id) {
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
        .then(response => {
          $rootScope.loadingMsg = '';
          return response.data;
        })
        .catch(err => {
          $rootScope.loadingMsg = '';
          throw err;
        });
    };

    this.getAllAccountTransferReports = conferenceId => {
      $rootScope.loadingMsg = 'Loading Reports';

      return $http
        .get(`${path(conferenceId)}/account/transfer/reports`)
        .then(response => {
          $rootScope.loadingMsg = '';
          return response.data;
        })
        .catch(err => {
          $rootScope.loadingMsg = '';
          throw err;
        });
    };

    this.getAccountTransferReport = url => {
      $rootScope.loadingMsg = 'Loading Report';

      return $http
        .get(url)
        .then(response => {
          $rootScope.loadingMsg = '';
          return response.data;
        })
        .catch(err => {
          $rootScope.loadingMsg = '';
          throw err;
        });
    };

    this.getAccountTransferData = data => {
      return data.registrations.reduce((result, registrant) => {
        return [
          ...result,
          ...registrant.accountTransfers.filter(
            accountTransfer => !accountTransfer.error,
          ),
        ];
      }, []);
    };

    this.getAccountTransferDataWithErrors = data => {
      return data.registrations.reduce((result, registrant) => {
        return [
          ...result,
          ...registrant.accountTransfers.filter(
            accountTransfer => accountTransfer.error,
          ),
        ];
      }, []);
    };

    this.submitAccountTransfers = accountTransfers => {
      $rootScope.loadingMsg = 'Submitting account transfers';
      // Filter out included key from account transfer object
      const filteredAccountTransfers = accountTransfers.map(accountTransfer => {
        return Object.keys(accountTransfer)
          .filter(key => key !== 'included')
          .reduce((obj, key) => {
            obj[key] = accountTransfer[key];
            return obj;
          }, {});
      });
      return $http
        .post('account/transfers', filteredAccountTransfers)
        .then(response => this.getAccountTransferReport(response.data))
        .finally(() => {
          $rootScope.loadingMsg = '';
        })
        .catch(errorResponse => {
          $rootScope.loadingMsg = '';
          modalMessage.error({
            message:
              errorResponse.data && errorResponse.data.error
                ? errorResponse.data.error
                : 'An error occurred while attempting to submit account transfers.',
          });
        });
    };
  });
