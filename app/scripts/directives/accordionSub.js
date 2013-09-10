'use strict';

angular.module('confRegistrationWebApp')
  .directive('accordionSub', function () {
    return {
      restrict: 'A',
      controller: function ($rootScope, $scope) {
        $scope.sendDragEvent = function (blockType) {
          $rootScope.$broadcast('dragVars', {blockId: blockType, moveType: 'new'});
        };
      },
      link: function postLink(scope, element) {
        element.find('a').bind('dragstart', function (ev) {
          scope.sendDragEvent(ev.target.id);
        });
        element.find('a').bind('dragend', function () {
          $('#crsDropZone').css('height', '0px');
        });
      }
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
