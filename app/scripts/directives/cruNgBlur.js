'use strict';

angular.module('confRegistrationWebApp')
  .directive('cruNgBlur', function () {
    return function (scope, elem, attrs) {
      elem.bind('blur', function () {
        scope.$apply(attrs.cruNgBlur);
      });
    };
  });
