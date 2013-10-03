'use strict';

angular.module('confRegistrationWebApp')
  .directive('showAnswer', function (AnswerCache, $modal, $timeout) {
    return {
      templateUrl: 'views/adminAnswerDisplay.html',
      restrict: 'E',
      scope: {
        answers: '=',
        block: '='
      },
      controller: function ($scope) {

        var editAnswerDialogOptions = {
          templateUrl: 'views/editAnswer.html',
          controller: 'EditAnswerDialogCtrl',
          scope: $scope
        };

        $scope.createEditDialog = function () {
          $modal.open(editAnswerDialogOptions).result.then(function () {
            AnswerCache.syncBlock($scope, 'answer');
          });
        };

        $scope.$watch('answers', function () {
          if ($scope.answers) {
            var answerObject = _.find($scope.answers, { blockId: $scope.block.id });
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
