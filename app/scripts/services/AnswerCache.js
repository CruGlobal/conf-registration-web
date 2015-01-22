'use strict';

angular.module('confRegistrationWebApp')
  .service('AnswerCache', function AnswerCache($cacheFactory, $rootScope, $http, $q) {
    var cache = $cacheFactory('answers');
    var blockIndex = $cacheFactory('blockIndex');

    var path = function (id) {
      return 'answers/' + (id || '');
    };

    var update = function (path, object) {
      updateServer(object);
      cache.put(path, object);
      blockIndex.put(object.block, object);
      $rootScope.$broadcast(path, object);
    };

    var updateServer = function (answer) {
      if ($rootScope.registerMode !== 'preview') {
        $http.put(path(answer.id), answer);
      }
    };

    var checkCache = function (path, callback) {
      var cachedObject = cache.get(path);
      if (angular.isDefined(cachedObject)) {
        callback(cachedObject, path);
      } else {
        $http.get(path).success(function (conferences) {
          cache.put(path, conferences);
          callback(conferences, path);
        });
      }
    };

    this.query = function (id) {
      checkCache(path(id), function (conferences, path) {
        $rootScope.$broadcast(path, conferences);
      });
    };

    this.get = function (id) {
      var defer = $q.defer();
      checkCache(path(id), function (conferences) {
        defer.resolve(conferences);
      });
      return defer.promise;
    };

    this.put = function (answer) {
      cache.put(path(answer.id), answer);
    };

    this.syncBlock = function (scope, name) {
      scope.$watch(name, function (answer, oldAnswer) {
        if(angular.isUndefined(answer) || angular.isUndefined(oldAnswer) || angular.equals(answer, oldAnswer)){
          return;
        }
        update(path(answer.id), answer);
      }, true);
    };
  });
