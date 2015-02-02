'use strict';

angular.module('confRegistrationWebApp')
  .controller('LoginDialogCtrl', function ($scope, $modalInstance, $location, apiUrl) {
    $scope.apiUrl = apiUrl;

    $scope.close = function () {
      $modalInstance.dismiss();
      $location.path('/');
    };
  });
