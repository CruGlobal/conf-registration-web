'use strict';

angular.module('confRegistrationWebApp')
  .factory('unauthorizedInterceptor', function ($q, $cookies, loginDialog) {
    return {
      responseError: function (rejection) {
        if (rejection.status === 401 && angular.isDefined($cookies.crsToken)) {
          loginDialog.show(true);
        }
        return $q.reject(rejection);
      }
    };
  });
