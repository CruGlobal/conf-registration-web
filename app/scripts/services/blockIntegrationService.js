angular
  .module('confRegistrationWebApp')
  .factory('blockIntegrationService', function ($http, $q) {
    const defaultIntegrationType = {
      id: 'NONE',
      ministryId: null,
      name: 'None',
      prettyName: 'None',
    };
    let integrationTypes = [defaultIntegrationType];
    let previousConferenceId = null;

    return {
      getIntegrationTypes: function (conferenceId) {
        if (!conferenceId) {
          return $q.resolve([defaultIntegrationType]);
        }

        if (integrationTypes.length && previousConferenceId === conferenceId) {
          return $q.resolve(integrationTypes);
        }

        previousConferenceId = conferenceId;

        return $http({
          method: 'GET',
          url: 'integrations/' + conferenceId,
        })
          .then(function (response) {
            integrationTypes = [defaultIntegrationType, ...response.data];
            return integrationTypes;
          })
          .catch(function () {
            return [defaultIntegrationType];
          });
      },

      integrationTypes: function () {
        return integrationTypes;
      },
    };
  });
