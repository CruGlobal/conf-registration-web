'use strict';

angular.module('confRegistrationWebApp')
  .factory('authorizationInterceptor', function ($cookies) {
    return {
      request: function (config) {
        config.headers.PreviousAuthorization = $cookies.crsPreviousToken;
        config.headers.Authorization = $cookies.crsToken;
        config.withCredentials = true;
        return config;
      }
    };
  });