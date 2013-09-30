'use strict';

angular.module('confRegistrationWebApp')
  .controller('EditAnswerDialogCtrl', function ($scope, $modalInstance) {
    $scope.close = function () {
      $modalInstance.close('');
    };

    $scope.submit = function () {
      $modalInstance.close();
    };
  });