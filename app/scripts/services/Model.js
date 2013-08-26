'use strict';

angular.module('confRegistrationWebApp')
  .service('Model', function Model($cacheFactory, $rootScope, $http, $q) {
    var cache = $cacheFactory('cache');

    var thisModel = this;

    this.create = function (path, object) {
      return $http.post(path, object).then(function (response) {
        var createdObjectPath = response.headers('Location');
        var createdObject = response.data;

        cache.put(createdObjectPath, createdObject);

        //todo dont bother populating the cache if the collection isn't cached
        thisModel.get(path).then(function (parentCollection) { 
          parentCollection.push(createdObject);
          cache.put(path, parentCollection);
          $rootScope.$broadcast(path, parentCollection);
        });

        return createdObject;
      });
    };

    this.get = function (path) {
      if (cache.get(path)) {
        return $q.when(angular.copy(cache.get(path)));
      } else {
        return $http.get(path).then(function (response) {
          cache.put(path, response.data);
          return response.data;
        });
      }
    };

    this.delete = function (path) {
      return $http.delete(path).then(function () {
        cache.remove(path);
        $rootScope.$broadcast(path);

        var match = /\/?(.*\/)(.+)$/.exec(path);
        var parentPath = match[1];
        var removedObjectId = match[2];

        thisModel.get(parentPath).then(function (oldParentCollection) {
          var parentCollection = _.reject(oldParentCollection, { id: removedObjectId });
          cache.put(parentPath, parentCollection);
          $rootScope.$broadcast(parentPath, parentCollection);
        });
      });
    };

    this.subscribe = function (scope, name, path) {
      scope.$watch(name, function (object) {
        if (angular.isDefined(object)) {
          thisModel.update(path, object);
        }
      }, true);

      scope.$on(path, function (event, object) {
        scope[name] = object;
      });

      thisModel.get(path).then(function (object) {
        scope[name] = object;
      });
    };

    this.update = function (path, object) {
      if (angular.equals(object, cache.get(path))) {
        // do nothing
      } else {
        $http.put(path, object).then(function () {
          cache.put(path, object);
          $rootScope.$broadcast(path, object);
        });
      }
    };
  });
