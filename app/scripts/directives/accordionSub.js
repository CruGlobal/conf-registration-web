'use strict';

angular.module('confRegistrationWebApp')
  .directive('accordionSub', function () {
    return {
      restrict: 'A'
    };
  }).directive('scrollPosition', function ($window) {
    return function (scope) {
      var windowEl = angular.element($window);
      windowEl.on('scroll', function () {
        scope.$apply(function () {
          var returnTop;
          if (windowEl.scrollTop() > 130) {
            returnTop = (windowEl.scrollTop() - 120);
          } else {
            returnTop = 0;
          }
          scope.scrollStyle = function () {
            return {
              marginTop: returnTop + 'px'
            };
          };
        });
      });
    };
  });
