'use strict';

angular.module('confRegistrationWebApp')
  .service('ConfCache', function ConfCache($cacheFactory, $rootScope, $http) {
    var cache = $cacheFactory('conf');

    this.query = function (id) {
      var path = 'conferences/' + (id || '');
      var cached = cache.get(path);
      if (angular.isDefined(cached)) {
        $rootScope.$broadcast(path, cached);
      } else {
        $http.get(path).success(function (conferences) {
          cache.put(path, conferences);
          $rootScope.$broadcast(path, conferences);
        });
      }
    };
  });
