'use strict';

angular.module('confRegistrationWebApp')
  .service('PermissionCache', function($cacheFactory, $rootScope, $http, $q) {
    var cache = $cacheFactory('permission');

    var path = function(conferenceId) {
      return 'conferences/' + conferenceId + '/permissions/current';
    }

    var update = function (path, object) {
      cache.put(path, object);
      $rootScope.$broadcast(path, object);
    };

    var checkCache = function (path, callback) {
      var cachedObject = cache.get(path);
      if (angular.isDefined(cachedObject)) {
        callback(cachedObject, path);
      } else {
        $http.get(path).success(function (data) {
          update(path, data);
          callback(data, path);
        });
      }
    };

    this.getForConference = function (conferenceId) {
      var defer = $q.defer();
      checkCache(path(conferenceId), defer.resolve);
      return defer.promise;
    };
  });


