'use strict';

angular.module('confRegistrationWebApp')
  .factory('apiUrl', function apiUrl($location) {
    var host = $location.$$host;
    if (_.contains(['localhost', 'stage.eventregistrationtool.com'], host)) {
      return 'https://internal-ert-api-staging-1544213769.us-east-1.elb.amazonaws.com/eventhub-api/rest/';
    } else {
      return 'https://api.eventregistrationtool.com/eventhub-api/rest/';
    }
  });
