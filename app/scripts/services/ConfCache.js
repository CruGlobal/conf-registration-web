'use strict';

angular.module('confRegistrationWebApp')
  .service('ConfCache', function ConfCache($cacheFactory, $rootScope, $http, $q, uuid) {
    var cache = $cacheFactory('conf');

    var path = function (id) {
      return 'conferences/' + (id || '');
    };

    var checkCache = function (path, callback) {
      var cachedConferences = cache.get(path);
      if (angular.isDefined(cachedConferences)) {
        callback(cachedConferences, path);
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

    this.create = function (name) {
      var data = {
        name: name
      };
      return $http.post(path(), data).then(function (response) {
        var conference = response.data;

        conference.registrationPages[0] = {
          id: uuid(),
          conferenceId: conference.id,
          position: 0,
          title: 'First Page',
          blocks: []
        };

        cache.put(path(conference.id), conference);
        return conference;
      });
    };
  });
