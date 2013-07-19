'use strict';

angular.module('confRegistrationWebApp')
  .directive('block', function () {
    return {
      templateUrl: 'views/blockDirective.html',
      restrict: 'E',
      scope: {
        'block': '=',
        'prefillAnswer': '=answer'
      },
      controller: function ($scope, answers, uuid) {
        $scope.answer = {
          id: uuid(),
          value: {}
        };

        angular.extend($scope.answer, $scope.prefillAnswer);

        angular.extend($scope.answer, answers);

        $scope.$watch('answer.value', function (newValue, oldValue) {
          if(!angular.equals(newValue, oldValue)) {
            $scope.answer.update($scope.answer);
          }
        }, angular.equals);
      }
    };
  });
