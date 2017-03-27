'use strict';

angular.module('confRegistrationWebApp')
  .service('ConfCache', function ConfCache($cacheFactory, $rootScope, $http, $q, uuid, modalMessage) {
    var cache = $cacheFactory('conf');

    var path = function (id) {
      return 'conferences/' + (id || '');
    };

    this.get = function (id, logLastAccess) {
      var defer = $q.defer();
      if(id && logLastAccess){ localStorage.setItem('lastAccess:' + id, Math.round(+new Date()/1000)); }

      var eventUrl = path(id);
      var cachedConferences = cache.get(eventUrl);
      if (angular.isDefined(cachedConferences)) {
        defer.resolve(cachedConferences);
      } else {
        $rootScope.loadingMsg = 'Loading Event Details';
        $http.get(eventUrl).success(function (conferences) {
          cache.put(eventUrl, conferences);
          defer.resolve(conferences);
        }).error(function(){
          defer.reject();
        }).finally(function(){
          $rootScope.loadingMsg = '';
        });
      }

      return defer.promise;
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
        allowEditRegistrationAfterComplete: true,
        registrationStartTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        registrationEndTime: moment().add(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        eventStartTime: moment().add(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        eventEndTime: moment().add(20, 'days').format('YYYY-MM-DD HH:mm:ss'),
        eventTimezone: 'America/New_York',
        registrantTypes: [{
          id: uuid(),
          name: 'Default',
          conferenceId: newConferenceId,
          cost: 0,
          familyStatus: 'DISABLED'
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
      return $http.post(path(), data).success(function () {
        cache.removeAll();
      }).error(function(data){
        modalMessage.error(data.error ? data.error.message : 'Error creating conference.');
      });
    };

    this.getPermissions = function (id) {
      var q = $q.defer();
      $http({
        method: 'GET',
        url: 'conferences/' + id + '/permissions'
      }).success(function (data) {
        q.resolve(data);
      }).error(function () {
        q.reject([]);
      });
      return q.promise;
    };
  });
