import moment from 'moment';

angular
  .module('confRegistrationWebApp')
  .service('ConfCache', function ConfCache(
    $cacheFactory,
    $rootScope,
    $http,
    $q,
    uuid,
    modalMessage,
  ) {
    var cache = $cacheFactory('conf');

    var path = function(id) {
      return 'conferences/' + (id || '');
    };

    this.get = function(id, logLastAccess) {
      var defer = $q.defer();
      if (id && logLastAccess) {
        localStorage.setItem(
          'lastAccess:' + id,
          Math.round(+new Date() / 1000),
        );
      }

      var eventUrl = path(id);
      var cachedConferences = cache.get(eventUrl);
      if (angular.isDefined(cachedConferences)) {
        defer.resolve(cachedConferences);
      } else {
        $rootScope.loadingMsg = 'Loading Event Details';
        $http
          .get(eventUrl)
          .then(function(response) {
            var conferences = response.data;
            cache.put(eventUrl, conferences);
            defer.resolve(conferences);
          })
          .catch(function(error) {
            defer.reject(error);
          })
          .finally(function() {
            $rootScope.loadingMsg = '';
          });
      }

      return defer.promise;
    };

    this.update = function(id, conference) {
      cache.put(path(id), conference);
    };

    this.empty = function() {
      cache.removeAll();
    };

    this.create = function(name) {
      var newConferenceId = uuid();
      var newPageId = uuid();

      var data = {
        id: newConferenceId,
        name: name,
        allowEditRegistrationAfterComplete: false,
        combineSpouseRegistrations: false,
        registrationStartTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        registrationEndTime: moment()
          .add(14, 'days')
          .format('YYYY-MM-DD HH:mm:ss'),
        eventStartTime: moment()
          .add(14, 'days')
          .format('YYYY-MM-DD HH:mm:ss'),
        eventEndTime: moment()
          .add(20, 'days')
          .format('YYYY-MM-DD HH:mm:ss'),
        eventTimezone: 'America/New_York',
        locationCountry: 'US',
        registrationTimezone: 'America/New_York',
        registrantTypes: [
          {
            id: uuid(),
            name: 'Default',
            conferenceId: newConferenceId,
            cost: 0,
            familyStatus: 'DISABLED',
          },
        ],
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
                required: true,
              },
              {
                id: uuid(),
                pageId: newPageId,
                type: 'emailQuestion',
                title: 'Email',
                profileType: 'EMAIL',
                position: 1,
                required: true,
              },
            ],
          },
        ],
        currency: { currencyCode: 'USD' },
      };
      return $http
        .post(path(), data)
        .then(function(response) {
          cache.removeAll();
          return response.data;
        })
        .catch(function(response) {
          modalMessage.error(
            response.data && response.data.error
              ? response.data.error.message
              : 'Error creating conference.',
          );
        });
    };

    this.getPermissions = function(id) {
      return $http({
        method: 'GET',
        url: 'conferences/' + id + '/permissions',
      })
        .then(function(response) {
          return response.data;
        })
        .catch(function() {
          return [];
        });
    };

    this.initCurrencies = function() {
      return $http({
        method: 'GET',
        url: 'payments/currency',
      })
        .then(function(response) {
          return response.data;
        })
        .catch(function() {
          return [];
        });
    };
  });
