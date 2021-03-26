angular
  .module('confRegistrationWebApp')
  .service('journalUploadService', function JournalUploadService(
    $rootScope,
    $http,
    $q,
    modalMessage,
  ) {
    const path = function(id) {
      return 'conferences/' + id + '/registrations';
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
      const defer = $q.defer();
      $rootScope.loadingMsg = 'Loading Registrations';

      $http
        .get(path(conferenceId), {
          params: queryParameters,
        })
        .then(response => {
          $rootScope.loadingMsg = '';
          defer.resolve(response.data);
        })
        .catch(() => {
          $rootScope.loadingMsg = '';
          defer.reject();
        });

      return defer.promise;
    };

    this.getAccountTransferData = data => {
      return _.flatten(
        data.registrations.reduce((result, registrant) => {
          return [
            ...result,
            registrant.accountTransfers.map(accountTransfer => accountTransfer),
          ];
        }, []),
      );
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
        .then(response => response.data)
        .finally(() => {
          $rootScope.loadingMsg = '';
        })
        .catch(() => {
          $rootScope.loadingMsg = '';
          modalMessage.error({
            message:
              'An error occurred while attempting to submit account transfers.',
          });
        });
    };
  });