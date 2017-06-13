
angular.module('confRegistrationWebApp')
  .service('RegistrationCache', function RegistrationCache($cacheFactory, $rootScope, $http, $q) {
    var cache = $cacheFactory('registration');
    var path = function (id) {
      return 'registrations/' + (id || '');
    };

    var update = function (path, object) {
      cache.put(path, angular.copy(object));
      $rootScope.$broadcast(path, object);
    };

    var checkCache = function (path, callback) {
      var cachedObject = cache.get(path);
      if (angular.isDefined(cachedObject)) {
        callback(cachedObject, path);
      } else {
        $http.get(path).then(function (response) {
          var data = response.data;
          update(path, data);
          callback(data, path);
        });
      }
    };

    this.update = function (path, registration, cb, errorCallback) {
      if ($rootScope.registerMode === 'preview') {
        $rootScope.previewRegCache = registration;
        if(cb){
          cb();
        }
        return;
      }

      var cachedReg = cache.get(path);
      if (angular.equals(registration, cachedReg)) {
        //do nothing
      } else {
        $http.put(path, registration).then(function(){
          //update cache
          cache.put(path, angular.copy(registration));

          if(cb){
            cb();
          }
        }, errorCallback);
      }
    };

    this.query = function (id) {
      checkCache(path(id), function (conferences, path) {
        $rootScope.$broadcast(path, conferences);
      });
    };

    this.emptyCache = function () {
      cache.removeAll();
    };

    this.get = function (id) {
      var defer = $q.defer();
      checkCache(path(id), defer.resolve);
      return defer.promise;
    };

    this.getCurrent = function (conferenceId) {
      var defer = $q.defer();

      checkCache('conferences/' + conferenceId + '/registrations/current', function (registration) {
        if ($rootScope.registerMode === 'preview') {
          if(angular.isUndefined($rootScope.previewRegCache)){
            registration.completed = false;
            registration.registrants = [];
            $rootScope.previewRegCache = registration;
          } else {
            registration = $rootScope.previewRegCache;
          }
        }
        update(path(registration.id), registration);
        defer.resolve(registration);
      });

      return defer.promise;
    };

    this.updateCurrent = function(conferenceId, currentRegistration){
      if ($rootScope.registerMode === 'preview') {
        $rootScope.previewRegCache = currentRegistration;
        return;
      }
      cache.put('conferences/' + conferenceId + '/registrations/current', angular.copy(currentRegistration));
    };

    this.getAllForConference = function (conferenceId, queryParameters) {
      var defer = $q.defer();
      $rootScope.loadingMsg = 'Loading Registrations';

      $http.get('conferences/' + conferenceId + '/registrations', {params: queryParameters}).then(function (response) {
        $rootScope.loadingMsg = '';
        defer.resolve(response.data);
      }).catch(function(){
        $rootScope.loadingMsg = '';
        defer.reject();
      });

      return defer.promise;
    };
  });
