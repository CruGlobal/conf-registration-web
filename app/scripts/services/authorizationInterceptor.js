
angular.module('confRegistrationWebApp')
  .factory('authorizationInterceptor', function ($cookies) {
    return {
      request: function (config) {
        config.headers.Authorization = $cookies.get('crsToken');
        config.withCredentials = true;
        return config;
      }
    };
  });
