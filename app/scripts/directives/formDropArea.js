'use strict';

angular.module('confRegistrationWebApp')
  .directive('formDropArea', function () {
    return {
      restrict: 'A',
      controller: function ($rootScope, $scope) {
        $scope.$on('dragVars', function (event, x) {
          $scope.blockId = x.blockId;
          $scope.moveType = x.moveType;
          //console.log('Receive broadcast dragStart',{blockId: $scope.blockId, moveType: $scope.moveType});
        });
      },
      link: function postLink(scope, element) {
        element.bind('drop', function (ev) {
          ev.preventDefault();
          var pageId = $(ev.target).closest('.crs-formElements').attr('data-page-id');
          var position = $(ev.target).closest('block').prevAll().length + scope.crsPositionAdd;
          if (scope.moveType === 'new') {
            var data = scope.blockId;
            var li = document.createElement('div');
            li.innerHTML = '<label>' + data + '</label>';
            $('#crsDropZone').before(li);
            scope.insertBlock(scope.blockId, pageId, position);
          } else if (scope.moveType === 'move') {
            $('#' + scope.blockId).insertBefore($('#crsDropZone'));
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
          if (isNear($(ev.target).closest('.crs-question-default')) === 'bottom') {
            $('#crsDropZone').insertAfter($(ev.target).closest('.crsQuestion'));
            scope.crsPositionAdd = 1;
          } else if (isNear($(ev.target).closest('.crs-question-default')) === 'top') {
            $('#crsDropZone').insertBefore($(ev.target).closest('.crsQuestion'));
            scope.crsPositionAdd = 0;
          }
          $('#crsDropZone').css('height', '120px');
          $('#crsDropZone').css('display', 'block');
        });

      }
    };
  });
