'use strict';

angular.module('confRegistrationWebApp').factory('analytics', function ($window, $rootScope, ProfileCache, ADOBE_ANALYTICS_STAGING, ADOBE_ANALYTICS_PROD) {
  $window.digitalData = {};

  //load analytics JS
  jQuery.ajax({
    url: $window.isStaging ? ADOBE_ANALYTICS_STAGING : ADOBE_ANALYTICS_PROD,
    dataType: 'script',
    cache: true
  });

  return {
    available: angular.isDefined($window._satellite),
    digitalData: $window.digitalData,
    pageLoad: function(){
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
      if($window._satellite){
        $window._satellite.pageBottom();
      }
    },
    track: angular.isDefined($window._satellite) && $window._satellite.track
  };
}).constant('ADOBE_ANALYTICS_STAGING', '//assets.adobedtm.com/3202ba9b02b459ee20779cfcd8e79eaf266be170/satelliteLib-928beaae1bce68f8836cc63dd18a9951aa3a1f4e-staging.js')
  .constant('ADOBE_ANALYTICS_PROD', '//assets.adobedtm.com/3202ba9b02b459ee20779cfcd8e79eaf266be170/satelliteLib-928beaae1bce68f8836cc63dd18a9951aa3a1f4e.js');
