'use strict';

angular.module('confRegistrationWebApp')
  .controller('cloneEventCtrl', function ($scope, defaultValue, permissions, permissionConstants) {
    $scope.name = defaultValue;
    $scope.permissionToClone = permissions.permissionInt >=permissionConstants.FULL;
  });