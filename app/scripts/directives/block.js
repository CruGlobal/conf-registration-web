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
      controller: function ($scope) {
        $scope.answer = angular.copy($scope.prefillAnswer) || {};

        $scope.updateAnswer = function () {
//          $scope.answer.$save();
          console.log('update answer in ' + $scope.block.id + ' to ' + angular.toJson($scope.answer));
        };
      }
    };
  });
