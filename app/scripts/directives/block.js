'use strict';

angular.module('confRegistrationWebApp')
  .directive('block', function () {
    return {
      templateUrl: 'views/blockDirective.html',
      restrict: 'E',
      controller: function ($scope, AnswerCache, RegistrationCache, uuid) {
        var currentRegistration = RegistrationCache.getCurrentRightNow($scope.conference.id);
        for (var i = 0;i < currentRegistration.answers.length; i++) {
          if (angular.isDefined(currentRegistration.answers[i]) &&
              currentRegistration.answers[i].blockId === $scope.block.id) {
            $scope.answer = currentRegistration.answers[i];
            break;
          }
        }
        if (!angular.isDefined($scope.answer)) {
          $scope.answer = {
            id : uuid.call(),
            registrationId : currentRegistration.id,
            blockId : $scope.block.id,
            value : {}
          };
          currentRegistration.answers.push($scope.answer);
        }

        AnswerCache.syncByBlockId($scope, 'answer');
      }
    };
  });
