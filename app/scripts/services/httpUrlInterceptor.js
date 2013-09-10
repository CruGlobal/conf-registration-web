'use strict';

angular.module('confRegistrationWebApp')
  .factory('httpUrlInterceptor', function (apiUrl) {
    return {
      request: function (config) {
        var passthroughRegexs = [
          /https?:\/\/.*/,
          /views\/.*/,
          /template\/.*/
        ];

        var match = function (regexp) {
          return regexp.test(config.url);
        };

        if (!_.any(passthroughRegexs, match)) {
          config.url = apiUrl + config.url;
        }

        return config;
      }
    };
  });