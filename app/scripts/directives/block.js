'use strict';

angular.module('confRegistrationWebApp')
  .directive('block', function () {
    return {
      templateUrl: 'views/blockDirective.html',
      restrict: 'E',
      controller: function ($scope, AnswerCache, RegistrationCache, uuid) {
        RegistrationCache.getCurrent($scope.conference.id).then(function(currentRegistration){
          var answerForThisBlock = _.where(currentRegistration.answers, { 'blockId': $scope.block.id });
          if (answerForThisBlock.length > 0) {
            $scope.answer = answerForThisBlock[0];
          }
          if (angular.isUndefined($scope.answer)) {
            $scope.answer = {
              id : uuid(),
              registrationId : currentRegistration.id,
              blockId : $scope.block.id,
              value : {}
            };
            currentRegistration.answers.push($scope.answer);
          }
        });
        AnswerCache.syncBlock($scope, 'answer');
      }
    };
  });
