'use strict';

angular.module('confRegistrationWebApp')
  .directive('textQuestion', function () {
    return {
      template: '<input type="text" data-ng-model="answer">',
      scope: {
        block: '='
      },
      controller: function ($scope) {
        $scope.updateAnswer = function () {
          console.log('block ' + $scope.block.id + ' answer changed to ' + $scope.answer);
        }
      },
      restrict: 'E',
      link: function (scope, elements) {
        var child = elements[0].firstChild;
        $(child).bind('blur', function () { // todo this is fragile and will break if the template changes
          scope.updateAnswer();
        });
      }
    };
  });
