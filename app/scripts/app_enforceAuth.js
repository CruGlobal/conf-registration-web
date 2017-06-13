
angular.module('confRegistrationWebApp').run(function ($rootScope, $cookies, $window, $location, $timeout, loginDialog, envService, ConfCache, PermissionCache, permissionConstants, modalMessage, $route) {
  // eslint-disable-next-line angular/on-watch
  $rootScope.$on('$routeChangeStart', function (event, next) {
    var nextRouteRequireLogin = next.authorization ? next.authorization.requireLogin : false;
    var nextRouteAllowsNoneAuth = next.authorization ? next.authorization.allowNoneAuth : false;
    var nextRouteEventAdminPermissionLevel = next.authorization ? next.authorization.eventAdminPermissionLevel : null;
    var nextRouteEventId = next.params.conferenceId;
    var crsToken = $cookies.get('crsToken');
    var crsAuthProviderType = $cookies.get('crsAuthProviderType');

    if(!nextRouteRequireLogin || (crsToken && nextRouteAllowsNoneAuth)){
      return;
    }

    if(crsToken && crsAuthProviderType !== 'NONE'){
      if(nextRouteEventAdminPermissionLevel){
        var permissions = PermissionCache.getForConferenceCache(nextRouteEventId);
        if(!permissions){
          event.preventDefault();
          PermissionCache.getForConference(nextRouteEventId).then(function(){
            $route.reload();
          });
          return;
        }else{
          var requiredPermissionLevel = permissionConstants[nextRouteEventAdminPermissionLevel];
          if (permissions.permissionInt < requiredPermissionLevel) {
            event.preventDefault();
            modalMessage.error({
              message: 'You do not have permission to access this page. Please contact an event admin to request permission if needed.',
              title: 'Permission Required'
            });
          }
        }
      }
      return;
    }

    if (!/^\/auth\/.*/.test($location.url())) {
      $cookies.put('intendedRoute', $location.path());
      if(angular.isDefined(next.params.regType)){
        $cookies.put('regType', next.params.regType);
      }
    }

    event.preventDefault();
    if (nextRouteAllowsNoneAuth && nextRouteEventId) {
      ConfCache.get(nextRouteEventId).then(function (conference) {
        if (conference.requireLogin) {
          loginDialog.show();
        } else {
          $window.location.href = envService.read('apiUrl') + 'auth/none/login';
        }
      });
    } else {
      loginDialog.show(angular.isDefined(crsToken));
    }
  });
});
