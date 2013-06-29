'use strict';

angular.module('confRegistrationWebApp')
  .directive('textQuestion', function () {
    return {
      templateUrl: 'views/textQuestion.html',
      controller: function ($scope) {
        $scope.updateAnswer = function () {
          console.log('block ' + $scope.block.id + ' answer changed to ' + $scope.answer);
        };
      },
      restrict: 'E',
      link: function (scope, elements) {
        elements.find('input').bind('blur', function () { // todo this is fragile and will break if the template changes
          scope.updateAnswer();
        });
      }
    };
  });
