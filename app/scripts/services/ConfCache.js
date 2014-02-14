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
      var registrationEndTime = new Date();
      registrationEndTime.setYear(registrationEndTime.getFullYear() + 1);
      var newConferenceId = uuid();
      var newPageId = uuid();

      var data = {
        id: newConferenceId,
        name: name,
        registrationStartTime: new Date(),
        registrationEndTime: registrationEndTime,
        contactPersonName: '',
        registrationPages: [{
          id: newPageId,
          conferenceId: newConferenceId,
          title: 'Sign Up',
          position: 0,
          blocks: [{
            id: uuid(),
            pageId: newPageId,
            type: 'nameQuestion',
            profileType: 'NAME',
            title: 'Name',
            position: 0,
            required: true
          },{
            id: uuid(),
            pageId: newPageId,
            type: 'emailQuestion',
            title: 'Email Address',
            profileType: 'EMAIL',
            position: 1,
            required: true
          }
          ]
        }]
      };
      return $http.post(path(), data).then(function (response) {
        if (response.status === 201) {
          var conference = response.data;
          cache.put(path(conference.id), conference);
          return conference;
        } else {
          alert('Error creating conference. ' + response.data.errorMessage + ': ' + response.data.customErrorMessage);
        }
      });
    };
  });
