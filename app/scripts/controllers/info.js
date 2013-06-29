'use strict';

angular.module('confRegistrationWebApp')
  .controller('InfoCtrl', function ($scope, conference) {
    $scope.conference = conference;

    $scope.page = conference.landingPage;
  });
