'use strict';

angular.module('confRegistrationWebApp')
  .factory('apiUrl', function apiUrl($location) {
    var host = $location.$$host;
    if (_.contains(['localhost', 'stage.eventregistrationtool.com'], host)) {
      return 'https://api.stage.eventregistrationtool.com/eventhub-api/rest/';
    } else {
      return 'https://api.eventregistrationtool.com/eventhub-api/rest/';
    }
  });