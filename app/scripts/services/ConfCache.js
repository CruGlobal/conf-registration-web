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

    this.getCallback = function (id, callback) {
      checkCache(path(id), function (conferences) {
        callback(conferences);
      });
    };

    this.update = function (id, conference) {
      cache.put(path(id), conference);
    };

    this.empty = function () {
      cache.removeAll();
    };

    this.create = function (name) {
      var newConferenceId = uuid();
      var newPageId = uuid();

      var data = {
        id: newConferenceId,
        name: name,
        registrationStartTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        registrationEndTime: moment().add(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        eventStartTime: moment().add(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        eventEndTime: moment().add(20, 'days').format('YYYY-MM-DD HH:mm:ss'),
        eventTimezone: 'America/New_York',
        paymentGatewayType: 'TRUST_COMMERCE',
        registrantTypes: [{
          id: uuid(),
          name: 'Default',
          conferenceId: newConferenceId,
          cost: 0,
          earlyRegistrationCutoff: moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss')
        }],
        registrationPages: [
          {
            id: newPageId,
            conferenceId: newConferenceId,
            title: 'Your Information',
            position: 0,
            blocks: [
              {
                id: uuid(),
                pageId: newPageId,
                type: 'nameQuestion',
                profileType: 'NAME',
                title: 'Name',
                position: 0,
                required: true
              },
              {
                id: uuid(),
                pageId: newPageId,
                type: 'emailQuestion',
                title: 'Email',
                profileType: 'EMAIL',
                position: 1,
                required: true
              }
            ]
          }
        ]
      };
      return $http.post(path(), data).then(function (response) {
        if (response.status === 201) {
          var conference = response.data;
          cache.removeAll();
          return conference;
        } else {
          alert('Error creating conference. ' + response.data.errorMessage + ': ' + response.data.customErrorMessage);
        }
      });
    };
  });
