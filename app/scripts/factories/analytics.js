'use strict';

angular.module('confRegistrationWebApp').factory('analytics', function ($window, $rootScope, ProfileCache) {
  $window.digitalData = {};

  $rootScope.$on('$routeChangeSuccess', function () {
    //logged in status
    $window.digitalData.loggedInStatus = 'Logged Out';
    ProfileCache.getCache(function(){
      $window.digitalData.loggedInStatus = 'Logged In';
      //TODO: add GR id once exposed by API
      //$window.digitalData.GUID = '';
    });

    //page title
    var pageTitle = $rootScope.globalPage ? $rootScope.globalPage.title : null;
    $window.digitalData.page = {
      pageInfo: {
        pageName: 'Event Registration Tool | ' + (pageTitle || 'no PageName found')
      }
    };
  });

  return {
    available: angular.isDefined($window._satellite),
    digitalData: $window.digitalData,
    track: angular.isDefined($window._satellite) && $window._satellite.track
  };
});
