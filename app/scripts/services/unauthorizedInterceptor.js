
angular.module('confRegistrationWebApp')
  .factory('unauthorizedInterceptor', function ($q, $cookies, loginDialog) {
    return {
      responseError: function (rejection) {
        if (rejection.status === 401 && angular.isDefined($cookies.get('crsToken'))) {
          loginDialog.show(true);
        }
        return $q.reject(rejection);
      }
    };
  });
