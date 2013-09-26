'use strict';

angular.module('confRegistrationWebApp')
  .directive('cruNgBlur', function () {
    return function (scope, elem, attrs) {
      elem.bind('blur', function () {
        console.log(attrs.cruNgBlur);
        scope.$apply(attrs.cruNgBlur);
      });
    };
  });
