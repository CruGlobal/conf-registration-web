'use strict';

angular.module('confRegistrationWebApp')
  .filter('toTrustedHtml', ['$sce', function($sce){
    return function(text) {
      return $sce.trustAsHtml(text);
    };
  }]);
