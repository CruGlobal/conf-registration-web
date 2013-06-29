'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminDataCtrl', function ($scope, registrations, conference) {
    $scope.conference = conference;

    $scope.blocks = [];

    angular.forEach(conference.pages, function (page) {
      angular.forEach(page.blocks, function (block) {
        if(block.type !== "paragraphContent")
        $scope.blocks.push(block);
      });
    });

    $scope.findAnswer = function (registration, blockId) {
      return _.find(registration.answers, function (answer) {
        return angular.equals(answer.block, blockId);
      });
    };

    $scope.registrations = registrations;
  });
