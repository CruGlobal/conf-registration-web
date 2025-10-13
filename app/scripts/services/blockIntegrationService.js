angular
  .module('confRegistrationWebApp')
  .factory('blockIntegrationService', function ($http, $q) {
    const defaultIntegrationType = {
      id: null,
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

        if (
          integrationTypes.length > 1 &&
          previousConferenceId === conferenceId
        ) {
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

      validateFieldSelection: function (
        integrationTypeId,
        blockIntegrations,
        blockId,
      ) {
        const integrationType = integrationTypes.find(
          (type) => type.id === integrationTypeId,
        );
        if (!integrationType) {
          return { valid: false, message: 'Invalid integration type.' };
        }
        // No validation needed for option 'None'
        if (integrationType.id === null) {
          return { valid: true, message: '' };
        }

        const currentBlockIntegration = blockIntegrations.find(
          (block) => block.integrationTypeId === integrationTypeId,
        );

        if (
          currentBlockIntegration &&
          currentBlockIntegration.blockId === blockId
        ) {
          return { valid: true, message: '' };
        }

        if (currentBlockIntegration) {
          return {
            valid: false,
            message: `${integrationType.prettyName} has already been selected on ${currentBlockIntegration.title}.`,
          };
        }
        return { valid: true, message: '' };
      },

      clearCache: function () {
        integrationTypes = [defaultIntegrationType];
        previousConferenceId = null;
      },
    };
  });
