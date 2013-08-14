'use strict';

angular.module('confRegistrationWebApp')
  .directive('formElements', function () {
    return {
      restrict: 'A',
      controller: function ($rootScope, $scope) {
        $scope.sendDragEvent = function (blockType) {
          $rootScope.$broadcast('dragVars', {blockId: blockType, moveType: 'move'});
        };
      },
      link: function postLink(scope, element) {
        element.bind('dragstart', function (ev) {
          scope.sendDragEvent(ev.target.id);
        });
        element.bind('dragend', function () {
          $('#crsDropZone').css('height', '0px');
          $('#crsDropZone').delay(480).hide(0);
        });

      }
    };
  });
