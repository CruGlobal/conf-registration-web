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
  });
