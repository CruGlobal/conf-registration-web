angular
  .module('confRegistrationWebApp')
  .controller('paymentReportCtrl', function(
    $rootScope,
    $scope,
    $http,
    $window,
    $cookies,
    paymentReportService,
    report,
    reportList,
    conference,
    envService,
  ) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'payment-report',
      bodyClass: '',
      confId: report.conferenceId,
      footer: true,
    };

    $scope.report = report;
    $scope.reports = reportList;
    $scope.conference = conference;
    $scope.excludedIds = {};
    $scope.queryParameters = {
      page: 1,
      limit: 20,
    };
    $scope.meta = {
      totalPages: 0,
    };
    $scope.apiUrl = envService.read('apiUrl');
    $scope.authToken = $cookies.get('crsToken');

    $scope.$watch(
      'queryParameters',
      function(newParameters, oldParameters) {
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

    $scope.refresh = function() {
      paymentReportService
        .getReport(report.conferenceId, $scope.queryParameters)
        .then(function(report) {
          $scope.meta = report.meta;
          $scope.report = report;
          for (const reportEntry of report.paymentReportEntries) {
            reportEntry.included = $scope.isIncluded(reportEntry.paymentId);
          }
        });
      paymentReportService.getAll(report.conferenceId).then(function(reports) {
        $scope.reports = reports;
      });
    };

    $scope.exportUrl = function() {
      let queryParamForExcludedPayments = paymentReportService.queryParamForExcludedPayments(
        $scope.excludedIds,
      );
      let currentReportId = $scope.queryParameters.currentReportId
        ? '/' + $scope.queryParameters.currentReportId
        : '';
      return `${$scope.apiUrl}conferences/${
        $scope.report.conferenceId
      }/payments/report/export${currentReportId}?Authorization=${
        $scope.authToken
      }${
        queryParamForExcludedPayments ? '&' + queryParamForExcludedPayments : ''
      }`;
    };

    $scope.refreshExcludedIds = function(id) {
      $scope.excludedIds[id] = !$scope.excludedIds[id];
    };

    $scope.isIncluded = function(id) {
      return !$scope.excludedIds[id];
    };

    $scope.noDataForLocking = function() {
      return (
        !!$scope.queryParameters.currentReportId ||
        $scope.report.meta.total <=
          paymentReportService.collectExcludedIds($scope.excludedIds).length
      );
    };

    $scope.lock = function() {
      paymentReportService
        .lockReport(report.conferenceId, $scope.excludedIds)
        .then(function(result) {
          $scope.queryParameters.currentReportId = result;
          $scope.excludedIds = {};
        });
    };
  });
