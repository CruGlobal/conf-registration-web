'use strict';

angular.module('confRegistrationWebApp')
  .service('PersonCache', function PersonCache($cacheFactory, $rootScope, $http, $q) {
    var cache = $cacheFactory('person');
    var path = 'person';

    var checkCache = function (path, callback) {
      var cachedObject = cache.get(path);
      if (angular.isDefined(cachedObject)) {
        callback(cachedObject, path);
      } else {
        $http.get(path).success(function (personData) {
          cache.put(path, personData);
          callback(personData, path);
        });
      }
    };

    this.get = function () {
      var defer = $q.defer();
      checkCache(path, function (personData) {
        defer.resolve(personData);
      });
      return defer.promise;
    };

    this.getCache = function (callback) {
      checkCache(path, function (personData) {
        callback(personData);
      });
    };
  });