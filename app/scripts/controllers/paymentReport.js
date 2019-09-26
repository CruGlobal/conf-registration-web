angular
  .module('confRegistrationWebApp')
  .controller('paymentReportCtrl', function(
    $rootScope,
    $scope,
    $uibModal,
    modalMessage,
    $http,
    $window,
    $cookies,
    paymentReportService,
    report,
    envService,
    // permissions,
    // permissionConstants,
  ) {
    $rootScope.globalPage = {
      // type: 'admin',
      mainClass: 'event-registrations',
      bodyClass: '',
      footer: true,
    };

    // function hasPermission() {
    //   if (permissions.permissionInt < permissionConstants.CHECK_IN) {
    //     modalMessage.error({
    //       title: 'Permissions Error',
    //       message:
    //         'You do not have permission to perform this action. Please contact an event administrator to request permission.',
    //     });
    //     return false;
    //   } else {
    //     return true;
    //   }
    // }

    $scope.report = report;
    $scope.blocks = [];
    $scope.queryParameters = {
      block: [],
      page: 1,
      limit: 5,
    };
    $scope.meta = {
      totalPages: 0,
    };
    $scope.apiUrl = envService.read('apiUrl');
    $scope.authToken = $cookies.get('crsToken');

    $scope.$watch(
      'queryParameters',
      function(q, oldQ) {
        //reset page
        if (q.page > 1 && q.page === oldQ.page) {
          $scope.queryParameters.page = 1;
          return;
        }

        if (q.page !== oldQ.page) {
          //scroll to top on page change
          $window.scrollTo(0, 0);
        }

        $scope.refreshPayments();
      },
      true,
    );

    $scope.refreshPayments = function() {
      paymentReportService
        .getAllForConference(report.conferenceId, $scope.queryParameters)
        .then(
          function(report) {
            $scope.meta = report.meta;
            $scope.report = report;
          },
          function() {
            $scope.registrations = [];
            $scope.registrants = [];
          },
        );
    };

    $scope.export = function($event) {
      $event.preventDefault();
      paymentReportService.exportReport(report.conferenceId);
    };

    $scope.lock = function() {
      paymentReportService
        .lockReport(report.conferenceId, $scope.queryParameters, $scope.report)
        .then(
          // function(report) {
          //   $scope.meta = report.meta;
          //   $scope.report = report;
          // },
          function() {
            $scope.registrations = [];
            $scope.registrants = [];
          },
        );
    };
  });
