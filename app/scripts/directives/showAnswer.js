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
        $scope.value = _.find($scope.answers, { blockId: $scope.block.id }).value;

        $scope.getSelectedCheckboxes = function (choices) {
          return _.keys(_.pick(choices, function (val) {
            return val === true;
          }));
        };
      }
    };
  });
