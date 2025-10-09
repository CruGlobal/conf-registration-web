angular
  .module('confRegistrationWebApp')
  .factory('blockIntegrationService', function () {
    const defaultIntegrationType = {
      id: 'NONE',
      ministryId: null,
      name: 'None',
      prettyName: 'None',
    };
    let integrationTypes = [defaultIntegrationType];

    return {
      integrationTypes: function () {
        return integrationTypes;
      },
    };
  });
