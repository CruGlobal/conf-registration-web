'use strict';

angular.module('confRegistrationWebApp')
  .directive('block', function () {
    return {
      templateUrl: 'views/blockDirective.html',
      restrict: 'E',
      controller: function ($scope, AnswerCache) {
        AnswerCache.syncByBlockId($scope, 'answer', $scope.block.id);
      }
    };
  });
