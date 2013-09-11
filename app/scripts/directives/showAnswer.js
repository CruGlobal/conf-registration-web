'use strict';

angular.module('confRegistrationWebApp')
  .directive('showAnswer', function () {
    return {
      templateUrl: 'views/adminAnswerDisplay.html',
      restrict: 'E',
      scope: {
        answers: '=',
        block: '='
      },
      controller: function ($scope) {
        $scope.$watch('answers', function() {
          if($scope.answers) {
            var answerObject = _.find($scope.answers, { blockId: $scope.block.id });
            if(answerObject) {
              $scope.value = answerObject.value;
            }
          }
        });

        $scope.getSelectedCheckboxes = function (choices) {
          return _.keys(_.pick(choices, function (val) {
            return val === true;
          }));
        };
      }
    };
  });
