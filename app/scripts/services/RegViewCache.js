'use strict';

angular.module('confRegistrationWebApp')
  .service('RegViewCache', function ConfCache($cacheFactory, $rootScope, $http, $q) {
    var cache = $cacheFactory('regViews');

    var path = function (id) {
      return 'conferences/' + id + '/registration-views';
    };

    var checkCache = function (path, callback) {
      var cachedViews = cache.get(path);
      if (angular.isDefined(cachedViews)) {
        callback(cachedViews, path);
      } else {
        $http.get(path).success(function (views) {
          cache.put(path, views);
          callback(views, path);
        });
      }
    };

    this.get = function (id, callback) {
      var defer = $q.defer();
      checkCache(path(id), function (views) {
        defer.resolve(views);
        callback(views);
      });
      return defer.promise;
    };

    this.update = function (id, views) {
      cache.put(path(id), views);
    };
  });
