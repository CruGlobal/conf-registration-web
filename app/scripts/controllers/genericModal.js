'use strict';

angular.module('confRegistrationWebApp')
  .controller('genericModal', function ($scope, $modalInstance, data) {
    $scope.isArray = _.isArray(data);
    $scope.data = data;

    $scope.close = function () {
      $modalInstance.close('');
    };
  });