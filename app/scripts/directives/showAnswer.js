import template from 'views/components/answerDisplay.html';

angular.module('confRegistrationWebApp')
  .directive('showAnswer', function () {
    return {
      templateUrl: template,
      restrict: 'E',
      scope: {
        block: '=',
        registrant: '=',
        showAmount: '='
      },
      controller: function ($scope) {
        if(angular.isDefined($scope.registrant)){
          if ($scope.registrant.answers) {
            var answerObject = _.find($scope.registrant.answers, { blockId: $scope.block.id });
            if (answerObject) {
              $scope.answer = answerObject;
            }
          }
        }

        $scope.getSelectedCheckboxes = function (choices) {
          return _.keys(_.pick(choices, function (val) {
            return val === true;
          }));
        };

      }
    };
  });
