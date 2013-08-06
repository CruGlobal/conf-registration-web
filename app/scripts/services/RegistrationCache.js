'use strict';

angular.module('confRegistrationWebApp')
  .service('RegistrationCache', function RegistrationCache($cacheFactory, $rootScope, $http, $q, AnswerCache) {
    var cache = $cacheFactory('registration');
    var path = function (id) {
      return 'registrations/' + (id || '');
    };

    var update = function (path, object) {
      cache.put(path, object);
      $rootScope.$broadcast(path, object);
    };

    var checkCache = function (path, callback) {
      var cachedObject = cache.get(path);
      if (angular.isDefined(cachedObject)) {
        callback(cachedObject, path);
      } else {
        $http.get(path).success(function (data) {
          update(path, data);
          callback(data, path);
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
      checkCache(path(id), defer.resolve);
      return defer.promise;
    };

    this.getCurrent = function (conferenceId) {
      var defer = $q.defer();

      checkCache('conferences/' + conferenceId + '/registrations/current', function (registration) {
        update(path(registration.id), registration);
        angular.forEach(registration.answers, AnswerCache.put);
        defer.resolve(registration);
      });

      return defer.promise;
    };

    this.getAllForConference = function (conferenceId) {
      var defer = $q.defer();

      checkCache('conferences/' + conferenceId + '/registrations', function (registrations) {
        angular.forEach(registrations, function (registration) {
          update(path(registration.id), registration);
        });
        defer.resolve(registrations);
      });

      return defer.promise;
    };
  });
