'use strict';

angular.module('confRegistrationWebApp')
  .directive('formDropArea', function () {
    return {
      restrict: 'A',
      controller: 'FormDropAreaCtrl',
      link: function postLink(scope, element) {
        scope.crsPositionAdd = 0;

        element.bind('drop', function (ev) {
          ev.preventDefault();
          var pageId = $(ev.target).closest('.crs-formElements').attr('data-page-id');
          var position = $(ev.target).closest('block').prevAll().length + scope.crsPositionAdd;
          if (scope.moveType === 'new') {
            var blockType = scope.blockId;
            scope.insertBlock(blockType, pageId, position);
          } else if (scope.moveType === 'move') {
            scope.moveBlock(scope.blockId, pageId, position);
          }
        });

        element.bind('dragover', function (ev) {
          ev.preventDefault();
          function isNear(element) {
            if ($(element).length === 0) {
              return;
            }
            var Y = event.pageY - $(element).offset().top;
            if (Y >= (element.height() / 2)) {
              return 'bottom';
            } else {
              return 'top';
            }
          }
          if (isNear($(ev.target).closest('.crs--question-default')) === 'bottom') {
            $('#crsDropZone').insertAfter($(ev.target).closest('.crsQuestion'));
            scope.crsPositionAdd = 1;
          } else if (isNear($(ev.target).closest('.crs--question-default')) === 'top') {
            $('#crsDropZone').insertBefore($(ev.target).closest('.crsQuestion'));
            scope.crsPositionAdd = 0;
          }
          $('#crsDropZone').css('height', '120px');
          $('#crsDropZone').css('display', 'block');
        });

      }
    };
  });
