'use strict';

angular.module('confRegistrationWebApp')
  .factory('apiUrl', function apiUrl($location, $rootScope) {
    var host = $location.$$host;
    if (_.contains(['localhost', 'stage.eventhub.org'], host)) {
      $rootScope.environment = 'staging';
      return 'https://api.stage.eventhub.org/eventhub-api/rest/';
    } else {
      $rootScope.environment = 'production';
      return 'https://api.eventhub.org/eventhub-api/rest/';
    }
  });