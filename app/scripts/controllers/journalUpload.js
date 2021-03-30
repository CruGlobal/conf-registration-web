import registrationsPaidPopoverTemplate from 'views/components/registrationsPaidPopover.html';
import paymentsModalTemplate from 'views/modals/paymentsModal.html';
import journalUploadReviewModalTemplate from 'views/modals/journalUploadReview.html';

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
    reports,
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
    $scope.accountTransfersWithErrors = journalUploadService.getAccountTransferDataWithErrors(
      registrations,
    );
    $scope.registrations = registrations;
    $scope.reports = reports;
    $scope.currentReportId = null;
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

    $scope.$watch('currentReportId', (newReportId, oldReportId) => {
      // scroll to top of page if selected report changes
      if (newReportId !== oldReportId) {
        $window.scrollTo(0, 0);
      }
      // if currentReportId is null, refresh account transfer data
      if (!newReportId) {
        $scope.refresh();
      } else {
        // set accountTransfers to current report's valid account transfers
        $scope.accountTransfers = $scope.reports
          .filter(report => report.id === newReportId)[0]
          .accountTransfers.filter(accountTransfer => !accountTransfer.error);
        // set accountTransfersWithErrors to current report's account transfers that have errors
        $scope.accountTransfersWithErrors = $scope.reports
          .filter(report => report.id === newReportId)[0]
          .accountTransfers.filter(accountTransfer => accountTransfer.error);
      }
    });

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
          $scope.accountTransfersWithErrors = journalUploadService.getAccountTransferDataWithErrors(
            data,
          );
          $scope.removeAllTransfersFromToInclude();
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

    $scope.allAccountTransfersIncluded = () =>
      $scope.accountTransfersToInclude.length ===
      $scope.accountTransfers.length;

    $scope.addAllTransfersToInclude = () => {
      angular.forEach($scope.accountTransfers, accountTransfer => {
        if ($scope.accountTransfersToInclude.indexOf(accountTransfer) === -1) {
          accountTransfer.included = true;
          $scope.accountTransfersToInclude.push(accountTransfer);
        }
      });
    };

    $scope.removeAllTransfersFromToInclude = () => {
      $scope.accountTransfersToInclude = [];
      angular.forEach($scope.accountTransfers, accountTransfer => {
        accountTransfer.included = false;
      });
      angular.forEach(
        $scope.accountTransfersWithErrors,
        accountTransferWithError => {
          accountTransferWithError.included = false;
        },
      );
    };

    $scope.getRemainingBalance = registrationId => {
      return _.find($scope.registrations.registrations, {
        id: registrationId,
      }).remainingBalance;
    };

    $scope.submit = () => {
      journalUploadService
        .submitAccountTransfers($scope.accountTransfersToInclude)
        .then(data => {
          // Refresh reports list after submitting
          journalUploadService
            .getAllAccountTransferReports(conference.id)
            .then(data => {
              $scope.reports = data;
            });
          $scope.viewSubmissionReview(data);
        });
    };

    $scope.viewSubmissionReview = report => {
      const journalReviewModalOptions = {
        templateUrl: journalUploadReviewModalTemplate,
        controller: 'journalUploadReviewModal',
        size: 'md',
        backdrop: 'static',
        resolve: {
          conference: () => conference,
          queryParameters: () => $scope.queryParameters,
          report: () => report,
        },
      };

      $uibModal.open(journalReviewModalOptions).result.then(data => {
        // If data has a value, the user chose to view the report
        if (data) {
          $scope.currentReportId = data;
        } else {
          // If not, refresh account transfers
          $scope.refresh();
        }
      });
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
