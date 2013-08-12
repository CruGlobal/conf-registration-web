'use strict';

angular.module('confRegistrationWebApp')
  .factory('httpUrlInterceptor', function () {
    return {
      request: function (config) {

        if (!/views\/.*/.test(config.url)) {
          config.url = 'http://54.235.46.34:8080/crs-http-json-api/rest/' + config.url;
        }

        return config;
      }
    };
  });