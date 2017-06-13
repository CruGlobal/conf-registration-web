
angular.module('confRegistrationWebApp')
  .service('PermissionCache', function ($cacheFactory, $http, $q, permissionConstants) {
    var cache = $cacheFactory('permission');

    var path = function (conferenceId) {
      return 'conferences/' + conferenceId + '/permissions/current';
    };

    var update = function (path, object) {
      cache.put(path, object);
    };

    var checkCache = function (path, callback) {
      var cachedObject = cache.get(path);
      if (angular.isDefined(cachedObject)) {
        callback(cachedObject, path);
      } else {
        $http.get(path).then(function (response) {
          var data = response.data;
          data.permissionInt = permissionConstants[data.permissionLevel];
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

    this.getForConferenceCache = function(conferenceId){
      return cache.get(path(conferenceId));
    };
  });


angular.module('confRegistrationWebApp')
  .constant('permissionConstants', {
    'CREATOR': 6,
    'FULL': 5,
    'UPDATE': 4,
    'CHECK_IN': 3,
    'SCHOLARSHIP': 2,
    'VIEW': 1,
    'REQUESTED': 0,
    'NONE': 0
  });
