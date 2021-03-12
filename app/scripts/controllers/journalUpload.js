import registrationsPaidPopoverTemplate from 'views/components/registrationsPaidPopover.html';
import paymentsModalTemplate from 'views/modals/paymentsModal.html';

angular
  .module('confRegistrationWebApp')
  .controller('journalUploadCtrl', function(
    $rootScope,
    $scope,
    $http,
    $window,
    $cookies,
    $uibModal,
    registrations,
    journalUploadService,
    conference,
    envService,
    permissions,
    modalMessage,
  ) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'journal-upload',
      bodyClass: '',
      confId: conference.id,
      footer: true,
    };
    $scope.paidPopoverTemplateUrl = registrationsPaidPopoverTemplate;
    $scope.accountTransfers = journalUploadService.getAccountTransferData(
      registrations,
    );
    $scope.conference = conference;
    $scope.accountTransfersToInclude = [];
    $scope.queryParameters = {
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
    };
    $scope.meta = {
      totalPages: 0,
    };
    $scope.apiUrl = envService.read('apiUrl');
    $scope.authToken = $cookies.get('crsToken');

    $scope.$watch(
      'queryParameters',
      (newParameters, oldParameters) => {
        //limit changed, reset page
        if (
          newParameters.page > 1 &&
          newParameters.page === oldParameters.page
        ) {
          $scope.queryParameters.page = 1;
          return;
        }

        if (newParameters.page !== oldParameters.page) {
          //scroll to top on page change
          $window.scrollTo(0, 0);
        }

        $scope.refresh();
      },
      true,
    );

    const throttleFilter = _.debounce(() => {
      $scope.$apply(() => {
        $scope.queryParameters.filter = $scope.strFilter;
      });
    }, 500);

    $scope.$watch('strFilter', strFilter => {
      if (angular.isDefined(strFilter)) {
        throttleFilter();
      }
    });

    $scope.resetStrFilter = () => {
      $scope.strFilter = '';
    };

    $scope.refresh = () => {
      journalUploadService
        .getRegistrationData(conference.id, $scope.queryParameters)
        .then(data => {
          $scope.meta = data.meta;
          $scope.accountTransfers = journalUploadService.getAccountTransferData(
            data,
          );
        });
    };

    $scope.refreshAccountTransfersToInclude = accountTransfer => {
      const accountTransferIndex = $scope.accountTransfersToInclude.indexOf(
        accountTransfer,
      );
      accountTransferIndex !== -1
        ? $scope.accountTransfersToInclude.splice(accountTransferIndex, 1)
        : $scope.accountTransfersToInclude.push(accountTransfer);
    };

    $scope.submit = () => {
      journalUploadService.submitAccountTransfers(
        $scope.accountTransfersToInclude,
      );
    };

    $scope.viewPayments = registrationId => {
      $http
        .get('registrations/' + registrationId)
        .then(response => {
          const paymentModalOptions = {
            templateUrl: paymentsModalTemplate,
            controller: 'paymentModal',
            size: 'lg',
            backdrop: 'static',
            resolve: {
              registration: () => response.data,
              conference: () => conference,
              permissions: () => permissions,
            },
          };

          $uibModal.open(paymentModalOptions).result.then(() => {
            $scope.refresh();
          });
        })
        .catch(() => {
          modalMessage.error(
            'Error: registration data could not be retrieved.',
          );
        });
    };
  });
