'use strict';

angular.module('confRegistrationWebApp')
  .directive('radioQuestion', function () {
    return {
      templateUrl: 'views/radioQuestion.html',
      restrict: 'E',
      scope: {
        'block': '='
      },
      controller: function ($scope) {
        $scope.updateAnswer = function (answer) {
          console.log('block ' + $scope.block.id + ' answer changed to ' + answer);
          $scope.answer = answer;
        };
      }
    };
  });
