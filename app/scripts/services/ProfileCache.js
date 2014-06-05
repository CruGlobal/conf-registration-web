'use strict';

angular.module('confRegistrationWebApp')
  .service('ProfileCache', function ProfileCache($cacheFactory, $rootScope, $http, $q) {
    var cache = $cacheFactory('profile');
    var path = 'profile';

    var checkCache = function (path, callback) {
      var cachedObject = cache.get(path);
      if (angular.isDefined(cachedObject)) {
        callback(cachedObject, path);
      } else {
        $http.get(path).success(function (profileData) {
          cache.put(path, profileData);
          callback(profileData, path);
        });
      }
    };

    this.get = function () {
      var defer = $q.defer();
      checkCache(path, function (profileData) {
        defer.resolve(profileData);
      });
      return defer.promise;
    };

    this.getCache = function (callback) {
      checkCache(path, function (profileData) {
        callback(profileData);
      });
    };
  });