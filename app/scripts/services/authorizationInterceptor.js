'use strict';

angular.module('confRegistrationWebApp')
  .factory('authorizationInterceptor', function () {
    return {
      request: function (config) {
        config.headers.Authorization = '06116be880109824642b1cae068e119a77eb62ed';
        config.withCredentials = true;
        return config;
      }
    }
  });