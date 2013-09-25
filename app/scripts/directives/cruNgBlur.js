'use strict';

angular.module('confRegistrationWebApp')
  .directive('cruNgBlur', ['$parse', function($parse) {
    return function( scope, elem, attrs ) {
      elem.bind('blur', function() {
        console.log(attrs.cruNgBlur);
        scope.$apply(attrs.cruNgBlur);
      });
    }
}]);
//app.directive('ngBlur', function() {
//  return function( scope, elem, attrs ) {
//    elem.bind('blur', function() {
//      scope.$apply(attrs.ngBlur);
//    });
//  };
//});