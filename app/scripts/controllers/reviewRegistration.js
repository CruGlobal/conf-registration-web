'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($scope, answers, conference) {
    $scope.conference = conference;
    $scope.answers = answers;
    console.log($scope.answers);

    $scope.blocks = [];

    angular.forEach(conference.pages, function (page) {
      angular.forEach(page.blocks, function (block) {
        if (block.type.indexOf('Content') === -1) {
          $scope.blocks.push(block);
        }
      });
    });

    $scope.findAnswer = function (blockId) {
      return _.find($scope.answers, function (answer) {
        return angular.equals(answer.block, blockId);
      });
    };
  });
