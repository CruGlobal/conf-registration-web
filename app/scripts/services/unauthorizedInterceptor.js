
angular.module('confRegistrationWebApp')
  .factory('unauthorizedInterceptor', function ($window, $q, $cookies, envService, loginDialog) {
    return {
      responseError: function (rejection) {
        if (rejection.status === 401 && angular.isDefined($cookies.get('crsToken'))) {
          if($cookies.get('crsAuthProviderType') === 'NONE') {
            $window.location.href = envService.read('apiUrl') + 'auth/none/login';
          }else{
            loginDialog.show(true);
          }
        }
        return $q.reject(rejection);
      }
    };
  });
