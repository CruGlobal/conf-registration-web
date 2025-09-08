angular
  .module('confRegistrationWebApp')
  .service(
    'RegistrationCache',
    function RegistrationCache($cacheFactory, $rootScope, $http, $q) {
      var cache = $cacheFactory('registration');
      var path = function (id) {
        return 'registrations/' + (id || '');
      };

      var update = function (path, object) {
        cache.put(path, angular.copy(object));
        $rootScope.$broadcast(path, object);
      };

      var checkCache = function (path) {
        var cachedObject = cache.get(path);
        if (angular.isDefined(cachedObject)) {
          return $q.resolve(cachedObject);
        } else {
          return $http
            .get(path)
            .then(function (response) {
              var data = response.data;
              update(path, data);
              return data;
            })
            .catch(function (response) {
              const errorMessage =
                response.data && response.data.error
                  ? response.data.error.message
                  : 'An error occurred while creating registration.';

              return $q.reject(errorMessage);
            });
        }
      };

      this.update = function (path, registration) {
        if ($rootScope.registerMode === 'preview') {
          $rootScope.previewRegCache = registration;
          return $q.resolve();
        }

        var cachedReg = cache.get(path);
        if (angular.equals(registration, cachedReg)) {
          //do nothing
          return $q.resolve();
        } else {
          //update cache
          return $http.put(path, registration).then(function () {
            cache.put(path, angular.copy(registration));
          });
        }
      };

      this.emptyCache = function () {
        cache.removeAll();
      };

      this.get = function (id) {
        return checkCache(path(id));
      };

      this.getCurrent = function (conferenceId) {
        return checkCache(
          'conferences/' + conferenceId + '/registrations/current',
        ).then(function (registration) {
          if ($rootScope.registerMode === 'preview') {
            if (angular.isUndefined($rootScope.previewRegCache)) {
              registration.completed = false;
              registration.registrants = [];
              $rootScope.previewRegCache = registration;
            } else {
              registration = $rootScope.previewRegCache;
            }
          }
          return registration;
        });
      };

      this.updateCurrent = function (conferenceId, currentRegistration) {
        if ($rootScope.registerMode === 'preview') {
          $rootScope.previewRegCache = currentRegistration;
          return;
        }
        cache.put(
          'conferences/' + conferenceId + '/registrations/current',
          angular.copy(currentRegistration),
        );
      };

      this.getAllForConference = function (conferenceId, queryParameters) {
        var defer = $q.defer();
        $rootScope.loadingMsg = 'Loading Registrations';

        $http
          .get('conferences/' + conferenceId + '/registrations', {
            params: queryParameters,
          })
          .then(function (response) {
            $rootScope.loadingMsg = '';
            defer.resolve(response.data);
          })
          .catch(function () {
            $rootScope.loadingMsg = '';
            defer.reject();
          });

        return defer.promise;
      };
    },
  );
