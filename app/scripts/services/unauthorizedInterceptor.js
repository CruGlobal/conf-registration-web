'use strict';

angular.module('confRegistrationWebApp')
  .factory('unauthorizedInterceptor', function ($q, $cookies) {
    return {
      responseError: function (rejection) {
        if (_.contains([401, 0], rejection.status) && typeof $cookies.crsToken !== 'undefined') {
          delete $cookies.crsToken;
          location.reload();
        }
        return $q.reject(rejection);
      }
    };
  });