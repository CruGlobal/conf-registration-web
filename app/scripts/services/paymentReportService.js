angular
  .module('confRegistrationWebApp')
  .service('paymentReportService', function PaymentReportService(
    $cacheFactory,
    $rootScope,
    $http,
    $q,
  ) {
    const path = function(id) {
      return 'conferences/' + (id || '') + '/payments/report';
    };

    function getReportData(url) {
      const defer = $q.defer();
      $rootScope.loadingMsg = 'Loading Details';
      $http
        .get(url)
        .then(function(response) {
          var report = response.data;
          defer.resolve(report);
        })
        .catch(function(error) {
          defer.reject(error);
        })
        .finally(function() {
          $rootScope.loadingMsg = '';
        });
      return defer.promise;
    }

    this.getAll = function(id) {
      var allReportsUrl = path(id);
      return getReportData(allReportsUrl);
    };

    this.getReport = function(conferenceId, queryParameters) {
      var defer = $q.defer();
      $rootScope.loadingMsg = 'Loading Payment Report';

      let report = queryParameters.currentReportId
        ? queryParameters.currentReportId
        : 'new';
      $http
        .get(path(conferenceId) + '/' + report, {
          params: queryParameters,
        })
        .then(function(response) {
          $rootScope.loadingMsg = '';
          defer.resolve(response.data);
        })
        .catch(function() {
          $rootScope.loadingMsg = '';
          defer.reject();
        });

      return defer.promise;
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
      var defer = $q.defer();
      let queryParamForExcludedPayments = this.queryParamForExcludedPayments(
        excludedIdsMap,
      );
      $http
        .post(
          `${path(conferenceId)}/lock${
            queryParamForExcludedPayments
              ? '?' + queryParamForExcludedPayments
              : ''
          }`,
          {},
        )
        .then(function(response) {
          $rootScope.loadingMsg = '';
          defer.resolve(response.data);
        })
        .catch(function() {
          $rootScope.loadingMsg = '';
          defer.reject();
        });

      return defer.promise;
    };
  });
