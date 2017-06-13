
angular.module('confRegistrationWebApp')
  .factory('httpUrlInterceptor', function (envService) {
    return {
      request: function (config) {
        var passthroughRegexs = [
          /https?:\/\/.*/,
          /^views\/.*/,
          /template\/.*/
        ];

        var match = function (regexp) {
          return regexp.test(config.url);
        };

        if (!_.some(passthroughRegexs, match)) {
          config.url = envService.read('apiUrl') + config.url;
        }

        return config;
      }
    };
  });
