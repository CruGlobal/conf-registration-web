'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminDataCtrl', function ($scope, registrations, conference) {
    $scope.conference = conference;

    $scope.blocks = [];
    $scope.reversesort = false;

    angular.forEach(conference.pages, function (page) {
      angular.forEach(page.blocks, function (block) {
        if (block.type.indexOf('Content') === -1) {
          $scope.blocks.push(block);
        }
      });
    });

    $scope.findAnswer = function (registration, blockId) {
      return _.find(registration.answers, function (answer) {
        return angular.equals(answer.block, blockId);
      });
    };

    $scope.answerSort = function (registration) {
      if (angular.isDefined($scope.order)) {
        if (angular.isDefined($scope.findAnswer(registration, $scope.order))) {
          return $scope.findAnswer(registration, $scope.order).value;
        }
      } else {
        return 0;
      }
    };

    $scope.setOrder = function (order) {
      if (order === $scope.order) {
        $scope.reversesort = !$scope.reversesort;
      } else {
        $scope.reversesort = false;
      }
      $scope.order = order;
    };

    $scope.registrations = registrations;
  });
