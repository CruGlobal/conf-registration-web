'use strict';

angular.module('confRegistrationWebApp')
  .controller('EditTotalDueDialogCtrl', function ($scope, RegistrationCache, $modalInstance) {
    $scope.originalTotalDue = $scope.registration.totalDue;

    $scope.close = function () {
      $scope.registration.totalDue = $scope.originalTotalDue;
      $modalInstance.close('');
    };

    $scope.submit = function () {
      RegistrationCache.update('registrations/' + $scope.registration.id, $scope.registration);
      $modalInstance.close();
    };
  });
