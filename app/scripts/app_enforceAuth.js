angular
  .module('confRegistrationWebApp')
  .run(function(
    $rootScope,
    $cookies,
    $window,
    $location,
    $timeout,
    loginDialog,
    envService,
    ConfCache,
    PermissionCache,
    permissionConstants,
    modalMessage,
    $q,
  ) {
    // eslint-disable-next-line angular/on-watch
    $rootScope.$on('$routeChangeStart', function(event, next) {
      var nextRouteRequireLogin = next.authorization
        ? next.authorization.requireLogin
        : false;
      var nextRouteAllowsNoneAuth = next.authorization
        ? next.authorization.allowNoneAuth
        : false;
      var nextRouteEventAdminPermissionLevel = next.authorization
        ? next.authorization.eventAdminPermissionLevel
        : null;
      var requiredPermissionLevel =
        permissionConstants[nextRouteEventAdminPermissionLevel];
      var nextRouteEventId = next.params.conferenceId;
      var crsToken = $cookies.get('crsToken');
      var crsAuthProviderType = $cookies.get('crsAuthProviderType');
      const checkForAuthError = () => {
        if (next.params.auth_error) {
          switch (next.params.auth_error) {
            case 'expiredAuthentication':
              return 'Your sign in attempt took too long. Please try again.';
            case 'expiredSession':
              return 'Your session has expired, plesase sign in.';
            default:
              return 'There was an error while trying to sign in. Please try again.';
          }
        }
      };

      const authError = checkForAuthError();
      if (authError) {
        loginDialog.show({
          authError,
        });
      }

      if (!nextRouteRequireLogin || (crsToken && nextRouteAllowsNoneAuth)) {
        return;
      }

      if (crsToken && crsAuthProviderType !== 'NONE') {
        if (nextRouteEventAdminPermissionLevel) {
          // eslint-disable-next-line angular/no-private-call
          next.$$route.resolve.checkPermissions = () =>
            PermissionCache.getForConference(nextRouteEventId)
              .catch(() => false)
              .then(permissions => {
                if (
                  !permissions ||
                  permissions.permissionInt < requiredPermissionLevel
                ) {
                  modalMessage.error({
                    message:
                      'You do not have permission to access this page. Please contact an event admin to request permission if needed.',
                    title: 'Permission Required',
                  });
                  return $q.reject('permission denied');
                }
              });
        }
        return;
      }

      if (!/^\/auth\/.*/.test($location.url())) {
        $cookies.put('intendedRoute', $location.path());
        if (angular.isDefined(next.params.regType)) {
          $cookies.put('regType', next.params.regType);
        }
      }

      event.preventDefault();
      if (nextRouteAllowsNoneAuth && nextRouteEventId) {
        ConfCache.get(nextRouteEventId).then(function(conference) {
          if (
            conference.relayLogin ||
            conference.facebookLogin ||
            conference.googleLogin
          ) {
            loginDialog.show({
              relayLogin: conference.relayLogin,
              facebookLogin: conference.facebookLogin,
              googleLogin: conference.googleLogin,
            });
          } else {
            $window.location.href =
              envService.read('apiUrl') + 'auth/none/login';
          }
        });
      } else {
        loginDialog.show({ status401: angular.isDefined(crsToken) });
      }
    });

    // eslint-disable-next-line angular/on-watch
    $rootScope.$on('$routeChangeError', function(event, current, previous) {
      if (previous) {
        $window.history.back();
      } else {
        $location.path('/').replace();
      }
    });
  });
