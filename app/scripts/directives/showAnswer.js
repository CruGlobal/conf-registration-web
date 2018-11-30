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
      controller: function ($scope, validateRegistrant) {
        if(angular.isDefined($scope.registrant)){
          if ($scope.registrant.answers) {
            var answerObject = _.find($scope.registrant.answers, { blockId: $scope.block.id });
            if (answerObject) {
              $scope.answer = answerObject;
            }
          }
        }

        $scope.getSelectedCheckboxes = function (choices) {
          var visibleChoices = _.filter($scope.block.content.choices, function(choice) {
            return $scope.choiceVisible($scope.block, choice, $scope.registrant);
          });
          visibleChoices = _.map(visibleChoices, 'value');

          return _.keys(_.pickBy(choices, function (value, key) {
            return value === true && visibleChoices.includes(key);
          }));
        };

        $scope.choiceVisible = function (block, choice, registrant) {
          if (angular.isUndefined(choice)) {
            return false;
          }
          return validateRegistrant.choiceVisible(block, choice, registrant);
        };

      }
    };
  });