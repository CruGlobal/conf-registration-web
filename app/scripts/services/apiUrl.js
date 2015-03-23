'use strict';

angular.module('confRegistrationWebApp')
  .factory('apiUrl', function apiUrl($location, $rootScope) {
//    var host = $location.$$host;
//    if (_.contains(['localhost', 'stage.eventregistrationtool.com'], host)) {
//      $rootScope.environment = 'staging';
//      return 'https://api.stage.eventregistrationtool.com/eventhub-api/rest/';
//    } else {
//      $rootScope.environment = 'production';
//      return 'https://api.eventregistrationtool.com/eventhub-api/rest/';
//    }
    return 'http://localhost:8080/eventhub-api/rest/';
  });