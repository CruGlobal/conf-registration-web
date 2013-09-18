'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminDetailsCtrl', function ($scope, $timeout, registrations, conference) {
    $scope.conference = conference;


    $scope.showWeeks = false;
    $scope.toggleWeeks = function () {
      $scope.showWeeks = ! $scope.showWeeks;
    };
    $scope.minDate = ( $scope.minDate ) ? null : new Date();


    $scope.open = function() {
      $timeout(function() {
        $scope.opened = true;
      });
    };

    $scope.dateOptions = {
      'year-format': "'yy'",
      'starting-day': 1
    };
  });
