'use strict';

angular.module('confRegistrationWebApp')
  .controller('CreateConferenceDialogCtrl', function ($scope, ConfCache, $modalInstance, $location) {
    $scope.close = function () {
      $modalInstance.close('');
    };

    $scope.submit = function (newConfName) {
        $modalInstance.close(newConfName);
    };
  });