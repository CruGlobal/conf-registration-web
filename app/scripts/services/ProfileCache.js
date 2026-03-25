angular
  .module('confRegistrationWebApp')
  .service(
    'ProfileCache',
    function ProfileCache($cacheFactory, $cookies, $http, $q, $timeout) {
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

            $timeout(function () {
              cache.remove(path);
              $http.get(path).then(function (response) {
                cache.put(path, response.data);
              });
            }, 3000);

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
