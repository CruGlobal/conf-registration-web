'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminDetailsCtrl', function ($scope, $timeout, Model, registrations, conference) {
    Model.subscribe($scope, 'conference', 'conferences/' + conference.id);
    $scope.conference = conference;

    $scope.showWeeks = false;
    $scope.toggleWeeks = function () {
      $scope.showWeeks = !$scope.showWeeks;
    };
    $scope.minDate = ($scope.minDate) ? null : new Date();


    $scope.openA = function () {
      $timeout(function () {
        $scope.openedA = true;
      });
    };
    $scope.openB = function () {
      $timeout(function () {
        $scope.openedB = true;
      });
    };
    $scope.openC = function () {
      $timeout(function () {
        $scope.openedC = true;
      });
    };
    $scope.openD = function () {
      $timeout(function () {
        $scope.openedD = true;
      });
    };
    $scope.openE = function () {
      $timeout(function () {
        $scope.openedE = true;
      });
    };

    $scope.dateOptions = {
      'starting-day': 0
    };
  });
