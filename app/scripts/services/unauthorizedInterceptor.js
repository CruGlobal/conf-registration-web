angular
  .module('confRegistrationWebApp')
  .factory('unauthorizedInterceptor', function(
    $window,
    $q,
    $cookies,
    envService,
    $location,
    loginDialog,
  ) {
    return {
      responseError: function(rejection) {
        if (
          rejection.status === 401 &&
          angular.isDefined($cookies.get('crsToken'))
        ) {
          if ($cookies.get('crsAuthProviderType') === 'NONE') {
            $window.location.href =
              envService.read('apiUrl') + 'auth/none/login';
          } else {
            if (!/^\/auth\/.*/.test($location.url())) {
              $cookies.put('intendedRoute', $location.path());
            }
            loginDialog.show({ status401: true });
          }
        }
        return $q.reject(rejection);
      },
    };
  });
