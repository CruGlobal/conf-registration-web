'use strict';

angular.module('confRegistrationWebApp')
  .controller('MainCtrl', function ($scope, Conferences) {
    $scope.conferences = Conferences.getAll();
  });
