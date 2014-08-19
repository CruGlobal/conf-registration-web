'use strict';

angular.module('confRegistrationWebApp')
  .factory('timezoneOffsetInterceptor', function () {
    return {
      request: function (config) {
        var regExp = /conferences\/[-a-zA-Z0-9]+$/;
        if (regExp.test(config.url) && (config.method === 'POST' || config.method === 'PUT')) {
          config.headers.tzoffset = new Date().getTimezoneOffset() * -1;
        }
        return config;
      }
    };
  });