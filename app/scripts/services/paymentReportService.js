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
      var eventUrl = path(id);
      $rootScope.loadingMsg = 'Loading Details';

      $http
        .get(eventUrl)
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

    this.getAllForConference = function(conferenceId, queryParameters) {
      var defer = $q.defer();
      $rootScope.loadingMsg = 'Loading Payment Report';

      $http
        .get(path(conferenceId), {
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
        .then(function() {
          // $rootScope.loadingMsg = '';
          // defer.resolve(response.data);
        })
        .catch(function() {
          // $rootScope.loadingMsg = '';
          // defer.reject();
        });

      return defer.promise;
    };

    this.exportReport = function(conferenceId) {
      var defer = $q.defer();
      $http.get(path(conferenceId) + '/export');

      return defer.promise;
    };
  });
