'use strict';

angular.module('confRegistrationWebApp')
  .factory('unauthorizedInterceptor', function ($q, $cookies, loginDialog) {
    return {
      responseError: function (rejection) {
        if (_.contains([401, 0], rejection.status) && angular.isDefined($cookies.crsToken)) {
          loginDialog.show(true);
        }
        return $q.reject(rejection);
      }
    };
  });
