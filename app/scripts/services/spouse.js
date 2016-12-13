'use strict';

angular.module('confRegistrationWebApp')
  .factory('spouse', function ($http, $cacheFactory) {
    var spouseRegistrationCache = $cacheFactory('spouseRegistration');

    var spouse = {
      // Preload a spouse registration so that calling getSpouseRegistration for that conference will complete sooner
      // This functionality is provided because looking up a spouse registration via getSpouseRegistration is a lengthy operation
      preloadSpouseRegistration: function (conferenceId) {
        return spouse.getSpouseRegistration(conferenceId);
      },

      // Lookup the registration for the logged in user's spouse for a particular conference
      // Return a promise that resolves to the registration if it could be found, or null if it could not
      getSpouseRegistration: function (conferenceId) {
        return $http.get('conferences/' + conferenceId + '/registrations/spouse', {
          cache: spouseRegistrationCache
        }).then(function (res) {
          if (res.status === 200) {
            // The spouse registration was found
            return res.data;
          }

          // The spouse registration was not found
          return null;
        }).catch(function () {
          // The spouse registration was not found
          return null;
        });
      }
    };

    return spouse;
  });
