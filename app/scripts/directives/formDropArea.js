'use strict';

angular.module('confRegistrationWebApp')
  .directive('formDropArea', function () {
    return {
      restrict: 'A',
      controller: function ($rootScope, $scope) {
        $scope.$on('dragVars', function(event, x) {
          $scope.blockId = x.blockId;
          $scope.moveType = x.moveType;
          console.log('Receive broadcast dragStart',{blockId: $scope.blockId, moveType: $scope.moveType});
        });
      },
      link: function postLink(scope, element, attrs) {
        element.bind('drop', function (ev) {
          ev.preventDefault();
          if (scope.moveType == 'new') {
            var data = scope.blockId;
            var li = document.createElement("div");
            li.innerHTML = '<label>' + data + '</label>';
            $('#crsDropZone').before(li);

            console.log(scope.blockId, $(ev.target).closest('.crs-formElements').attr('data-page-id'), $(ev.target).closest('block').prevAll().length + scope.crsPositionAdd);
            insertBlock(scope.blockId, $(ev.target).closest('.crs-formElements').attr('data-page-id'), $(ev.target).closest('block').prevAll().length + scope.crsPositionAdd);
          } else if (scope.moveType == 'move') {
            $('#' + scope.blockId).insertBefore($('#crsDropZone'));
            console.log(scope.blockId, $(ev.target).closest('.crs-formElements').attr('data-page-id'), $(ev.target).closest('block').prevAll().length + scope.crsPositionAdd);
            moveBlock(scope.blockId, $(ev.target).closest('.crs-formElements').attr('data-page-id'), $(ev.target).closest('block').prevAll().length + scope.crsPositionAdd);
          }
        });

        element.bind('dragover', function (ev) {
          ev.preventDefault();
          if (isNear($(ev.target).closest('.crsQuestion')) == 'bottom') {
            $('#crsDropZone').insertAfter($(ev.target).closest('.crsQuestion'));
            scope.crsPositionAdd = 1;
          } else if (isNear($(ev.target).closest('.crsQuestion')) == 'top') {
            $('#crsDropZone').insertBefore($(ev.target).closest('.crsQuestion'));
            scope.crsPositionAdd = 0;
          }
          console.log(isNear($(ev.target).closest('.crsQuestion')))
          $('#crsDropZone').css('height', '120px');

          function isNear(element) {
            if ($(element).length == 0) {
              return;
            }
            var Y = event.pageY - $(element).offset().top;
            if (Y >= (element.height() / 2)) {
              return 'bottom';
            } else {
              return 'top';
            }
          }
        });

      }
    };
  });
