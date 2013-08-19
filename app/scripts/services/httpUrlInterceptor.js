'use strict';

angular.module('confRegistrationWebApp')
  .factory('httpUrlInterceptor', function (apiUrl) {
    return {
      request: function (config) {

        if (!/views\/.*/.test(config.url) && !/https?:\/\/.*/.test(config.url)) {
          config.url = apiUrl + config.url;
        }

        return config;
      }
    };
  });