'use strict';

angular.module('confRegistrationWebApp')
  .factory('apiUrl', function apiUrl($location) {
    var host = $location.$$host;
    if (_.contains(['localhost', 'stage.eventhub.org'], host)) {
      return 'https://api.stage.eventhub.org/eventhub-api/rest/';
    } else {
      return 'https://api.eventhub.org/eventhub-api/rest/';
    }
  });