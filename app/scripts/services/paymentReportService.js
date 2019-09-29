angular
  .module('confRegistrationWebApp')
  .service('paymentReportService', function ConfCache( //what is ConfCache
    $cacheFactory,
    $rootScope,
    $http,
    $q,
    // uuid,
    // modalMessage,
  ) {
    var path = function(id) {
      return 'conferences/' + (id || '') + '/payments/report';
    };

    this.get = function(id) {
      var defer = $q.defer();
      var newReportUrl = path(id) + '/new';
      $rootScope.loadingMsg = 'Loading Details';

      $http
        .get(newReportUrl)
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
    };

    this.getAll = function(id) {
      var defer = $q.defer();
      var allReportsUrl = path(id);
      $rootScope.loadingMsg = 'Loading Details';

      $http
        .get(allReportsUrl)
        .then(function(response) {
          var reports = response.data;
          defer.resolve(reports);
        })
        .catch(function(error) {
          defer.reject(error);
        })
        .finally(function() {
          $rootScope.loadingMsg = '';
        });

      return defer.promise;
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

    this.lockReport = function(conferenceId, queryParameters, report) {
      var defer = $q.defer();

      $http
        .post(path(conferenceId) + '/lock', report)
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

    this.exportReport = function(conferenceId) {
      var defer = $q.defer();
      $http.get(path(conferenceId) + '/export');

      return defer.promise;
    };
  });
