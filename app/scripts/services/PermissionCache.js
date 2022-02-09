angular
  .module('confRegistrationWebApp')
  .service(
    'PermissionCache',
    function ($cacheFactory, $http, $q, permissionConstants) {
      var cache = $cacheFactory('permission');

      var path = function (conferenceId) {
        return 'conferences/' + conferenceId + '/permissions/current';
      };

      var update = function (path, object) {
        cache.put(path, object);
      };

      var checkCache = function (path) {
        var cachedObject = cache.get(path);
        if (angular.isDefined(cachedObject)) {
          return $q.resolve(cachedObject, path);
        } else {
          return $http.get(path).then(function (response) {
            var data = response.data;
            data.permissionInt = permissionConstants[data.permissionLevel];
            update(path, data);
            return data;
          });
        }
      };

      this.getForConference = function (conferenceId) {
        return checkCache(path(conferenceId));
      };
    },
  );

angular.module('confRegistrationWebApp').constant('permissionConstants', {
  CREATOR: 6,
  FULL: 5,
  UPDATE: 4,
  CHECK_IN: 3,
  SCHOLARSHIP: 2,
  VIEW: 1,
  REQUESTED: 0,
  NONE: 0,
});
