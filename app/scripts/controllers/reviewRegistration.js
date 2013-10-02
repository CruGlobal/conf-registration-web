'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($scope, registration, conference, Model) {

    $scope.conference = conference;
    $scope.registration = registration;
    $scope.answers = registration.answers;
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

    $scope.confirmRegistration = function () {
      $scope.registration.completed = true;
      Model.update('/registrations/' + registration.id, $scope.registration);
    };
  });
