'use strict';

angular.module('confRegistrationWebApp')
  .directive('showAnswer', function () {
    return {
      templateUrl: 'views/adminAnswerDisplay.html',
      restrict: 'E',
      scope: {
        block: '=',
        registration: '='
      },
      controller: function ($scope) {
        $scope.$watch('answers', function () {
          if ($scope.registration.answers) {
            var answerObject = _.find($scope.registration.answers, { blockId: $scope.block.id });
            if (answerObject) {
              $scope.answer = answerObject;
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
