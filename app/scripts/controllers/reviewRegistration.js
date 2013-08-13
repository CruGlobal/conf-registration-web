'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($scope, answers, conference) {
    $scope.conference = conference;
    $scope.answers = answers;

    $scope.blocks = [];

    angular.forEach(conference.registrationPages, function (page) {
      angular.forEach(page.blocks, function (block) {
        if (block.type.indexOf('Content') === -1) {
          $scope.blocks.push(block);
        }
      });
    });

    $scope.findAnswer = function (blockId) {
      return _.find($scope.answers, {blockId: blockId});
    };
  });
