'use strict';

angular.module('confRegistrationWebApp')
  .factory('unauthorizedInterceptor', function ($q, $cookies) {
    return {
      responseError: function (rejection) {
        if (rejection.status === 401 && $cookies.crsToken) {
          delete $cookies.crsToken;
        }

        return $q.reject(rejection);
      }
    };
  });