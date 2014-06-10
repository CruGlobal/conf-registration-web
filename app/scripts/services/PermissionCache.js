'use strict';

angular.module('confRegistrationWebApp')
  .service('PermissionCache', function ($cacheFactory, $rootScope, $http, $q) {
    var cache = $cacheFactory('permission');

    var path = function (conferenceId) {
      return 'conferences/' + conferenceId + '/permissions/current';
    };

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
          switch (data.permissionLevel) {
          case 'CREATOR':
            data.permissionInt = 4;
            break;
          case 'FULL':
            data.permissionInt = 3;
            break;
          case 'UPDATE':
            data.permissionInt = 2;
            break;
          case 'View':
            data.permissionInt = 1;
            break;
          default:
            data.permissionInt = 0;
          }
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


angular.module('confRegistrationWebApp')
  .constant('permissionConstants', {
    'CREATOR': 4,
    'FULL': 3,
    'UPDATE': 2,
    'VIEW': 1,
    'NONE': 0
  });