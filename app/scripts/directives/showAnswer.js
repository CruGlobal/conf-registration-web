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
          var blockChoices = $scope.block.content.choices;
          var posibleChoices = [];
          for (var i = 0; i < blockChoices.length; i++) {
            if ($scope.choiceVisible($scope.block, blockChoices[i], $scope.registrant)){
              posibleChoices.push(blockChoices[i].value);
            }
          }
          return _.keys(_.pickBy(choices, function (key,val) {
            return key === true && posibleChoices.includes(val);
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