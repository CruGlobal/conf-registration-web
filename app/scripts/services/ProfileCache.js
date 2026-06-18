import { updateRollbarPerson } from 'scripts/errorNotify.js';

angular
  .module('confRegistrationWebApp')
  .service(
    'ProfileCache',
    function ProfileCache($cacheFactory, $cookies, $http, $q) {
      var cache = $cacheFactory('profile');
      var path = 'profile';

      var checkCache = function (path) {
        var cachedObject = cache.get(path);
        if (angular.isDefined(cachedObject)) {
          return $q.resolve(cachedObject);
        } else {
          return $http.get(path).then(function (response) {
            var profileData = response.data;
            cache.put(path, profileData);
            updateRollbarPerson({
              id: profileData.id,
              username: profileData.firstName + ' ' + profileData.lastName,
              email: profileData.email,
            });
            return profileData;
          });
        }
      };

      this.getCache = function () {
        if (!$cookies.get('crsToken')) {
          return $q.reject();
        }
        return checkCache(path);
      };

      this.clearCache = function () {
        cache.remove(path);
        updateRollbarPerson(null);
      };

      this.globalUser = function () {
        return cache.get(path);
      };

      this.globalGreetingName = function () {
        var cachedObject = this.globalUser();
        return angular.isDefined(cachedObject) ? cachedObject.firstName : null;
      };
    },
  );
