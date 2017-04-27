'use strict';

angular.module('confRegistrationWebApp')
  .service('ProfileCache', function ProfileCache($cacheFactory, $cookies, $http) {
    var cache = $cacheFactory('profile');
    var path = 'profile';

    var checkCache = function (path, callback) {
      var cachedObject = cache.get(path);
      if (angular.isDefined(cachedObject)) {
        callback(cachedObject, path);
      } else {
        $http.get(path).then(function (response) {
          var profileData = response.data;
          cache.put(path, profileData);
          callback(profileData, path);
        });
      }
    };

    this.getCache = function (callback) {
      if(!$cookies.crsToken){ return; }
      checkCache(path, function (profileData) {
        if(callback){ callback(profileData); }
      });
    };

    this.globalGreetingName = function(){
      var cachedObject = cache.get(path);
      return angular.isDefined(cachedObject) ? cachedObject.firstName : null;
    };
  });
