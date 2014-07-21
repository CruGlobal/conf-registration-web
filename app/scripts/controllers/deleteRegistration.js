'use strict';

angular.module('confRegistrationWebApp')
  .controller('deleteRegistrationCtrl', function ($scope, ConfCache, $modalInstance) {
    $scope.close = function () {
      $modalInstance.close(false);
    };

    $scope.delete = function () {
      $modalInstance.close(true);
    };
  });