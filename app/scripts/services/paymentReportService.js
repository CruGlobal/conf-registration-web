angular
  .module('confRegistrationWebApp')
  .service('paymentReportService', function PaymentReportService(
    $cacheFactory,
    $rootScope,
    $http,
  ) {
    const path = function(id) {
      return 'conferences/' + id + '/payments/report';
    };

    function getReportData(url) {
      $rootScope.loadingMsg = 'Loading Details';
      return $http
        .get(url)
        .then(function(response) {
          return response.data;
        })
        .finally(function() {
          $rootScope.loadingMsg = '';
        });
    }

    this.getAll = function(id) {
      var allReportsUrl = path(id);
      return getReportData(allReportsUrl);
    };

    this.getReport = function(conferenceId, queryParameters) {
      $rootScope.loadingMsg = 'Loading Payment Report';

      let report = queryParameters.currentReportId
        ? queryParameters.currentReportId
        : 'new';
      return $http
        .get(path(conferenceId) + '/' + report, {
          params: queryParameters,
        })
        .then(function(response) {
          return response.data;
        })
        .finally(function() {
          $rootScope.loadingMsg = '';
        });
    };

    this.collectExcludedIds = function(excludedIdsMap) {
      return Object.keys(excludedIdsMap).filter(k => excludedIdsMap[k]);
    };

    this.queryParamForExcludedPayments = function(excludedIdsMap) {
      let excludedIds = this.collectExcludedIds(excludedIdsMap);
      return excludedIds.length > 0
        ? 'excludedPaymentsIds=' + excludedIds.join('&excludedPaymentsIds=')
        : '';
    };

    this.lockReport = function(conferenceId, excludedIdsMap) {
      let queryParamForExcludedPayments = this.queryParamForExcludedPayments(
        excludedIdsMap,
      );
      return $http
        .post(
          `${path(conferenceId)}/lock${
            queryParamForExcludedPayments
              ? '?' + queryParamForExcludedPayments
              : ''
          }`,
          {},
        )
        .then(function(response) {
          return response.data;
        })
        .finally(function() {
          $rootScope.loadingMsg = '';
        });
    };
  });
