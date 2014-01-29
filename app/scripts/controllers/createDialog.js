'use strict';

angular.module('confRegistrationWebApp')
  .controller('CreateDialogCtrl', function ($scope, ConfCache, $modalInstance, defaultValue) {
    $scope.name = defaultValue;
    $scope.close = function () {
      $modalInstance.close('');
    };

    $scope.submit = function (newConfName) {
      $modalInstance.close(newConfName);
    };
  });