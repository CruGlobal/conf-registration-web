'use strict';

angular.module('confRegistrationWebApp')
  .factory('unauthorizedInterceptor', function ($q, $cookies) {
    return {
      responseError: function (rejection) {
        if (_.contains([401, 0], rejection.status) && angular.isDefined($cookies.crsToken)) {
          delete $cookies.crsToken;
          location.reload();
        }
        return $q.reject(rejection);
      }
    };
  });