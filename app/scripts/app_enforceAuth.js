'use strict';

angular.module('confRegistrationWebApp').run(function ($rootScope, $cookies, $window, $location, loginDialog, apiUrl, ConfCache) {
  $rootScope.$on('$routeChangeStart', function (event, next) {
    var nextRouteRequireLogin = next.authorization ? next.authorization.requireLogin : false;
    var nextRouteAllowsNoneAuth = next.authorization ? next.authorization.allowNoneAuth : false;
    var crsToken = $cookies.crsToken;
    var crsAuthProviderType = $cookies.crsAuthProviderType;

    if (!/^\/auth\/.*/.test($location.url())) {
      $cookies.intendedRoute = $location.path();
      if(angular.isDefined(next.params.regType)){
        $cookies.regType = next.params.regType;
      }
    }

    if(!nextRouteRequireLogin || (crsToken && crsAuthProviderType !== 'NONE') || (crsToken && nextRouteAllowsNoneAuth)){
      return;
    }

    event.preventDefault();
    if (nextRouteAllowsNoneAuth && next.params.conferenceId) {
      ConfCache.get(next.params.conferenceId).then(function (conference) {
        if (conference.requireLogin) {
          loginDialog.show();
        } else {
          $window.location.href = apiUrl + 'auth/none/login';
        }
      });
    } else {
      loginDialog.show(angular.isDefined(crsToken));
    }
  });
});
