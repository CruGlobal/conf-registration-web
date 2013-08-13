'use strict';

angular.module('confRegistrationWebApp')
  .directive('block', function () {
    return {
      templateUrl: 'views/blockDirective.html',
      restrict: 'E',
      scope: true,
      controller: function ($scope, AnswerCache, $location) {
        AnswerCache.syncByBlockId($scope, 'answer', $scope.block.id);

        $scope.wizard = $location.path().indexOf('wizard') !== -1;
      }
    };
  });
