'use strict';

angular.module('confRegistrationWebApp')
  .controller('RegisterCtrl', function ($scope, conference) {
    $scope.conference = conference;
  });
