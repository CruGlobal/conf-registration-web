'use strict';

angular.module('confRegistrationWebApp')
  .service('Model', function Model($cacheFactory, $rootScope, $http, $q) {
    var cache = $cacheFactory('cache');

    var Model = this;

    this.create = function (path, object) {
      return $http.post(path, object).then(function (response) {
        var createdObjectPath = response.headers('Location');
        var createdObject = response.data;

        cache.put(createdObjectPath, createdObject);

        Model.get(path).then(function (parentCollection) {
          parentCollection.push(createdObject);
          cache.put(path, parentCollection);
          $rootScope.$broadcast(path, parentCollection);
        });

        return createdObject;
      });
    };

    this.get = function (path) {
      var cachedObject = cache.get(path);

      if (cachedObject) {
        return $q.when(cachedObject);
      } else {
        return $http.get(path).then(function (response) {
          cache.put(path, response.data);
        });
      }
    };

    this.delete = function (path) {
      return $http.delete(path).then(function () {
        cache.remove(path);
        $rootScope.$broadcast(path);

        var match = /\/?(.*)\/(.+)$/.exec(path);
        var parentPath = match[0];
        var removedObjectId = match[1];

        Model.get(parentPath).then(function (oldParentCollection) {
          var parentCollection = _.reject(oldParentCollection, { id: removedObjectId });
          cache.put(path, parentCollection);
          $rootScope.$broadcast(path, parentCollection);
        });
      });
    };

    this.subscribe = function (scope, name, path) {
      scope.$watch(name, function (newObject) {
        if(angular.isDefined(newObject)) {
          Model.update(path, newObject);
        }
      });

      scope.$on(path, function (event, object) {
        scope[name] = object;
      });

      return Model.get(path);
    };

    this.update = function (path, object) {
      if(angular.equals(object, cache.get(path))) {
        // do nothing
      } else {
        $http.put(path, object).then(function () {
          cache.put(path, object);
          $rootScope.$broadcast(path, object);
        });
      }
    };
  });
