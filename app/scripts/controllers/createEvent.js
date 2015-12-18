'use strict';

angular.module('confRegistrationWebApp')
  .controller('createEventCtrl', function ($scope, defaultValue) {
    $scope.name = defaultValue;
  });