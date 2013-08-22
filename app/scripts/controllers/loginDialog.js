'use strict';

angular.module('confRegistrationWebApp')
  .controller('LoginDialogCtrl', function ($scope, $window, dialog, apiUrl) {
    $scope.apiUrl = apiUrl;
    $scope.submit = function () {
      $window.location.href = apiUrl + 'auth/none/login?email=' + $scope.email;
    };
    $scope.closeDialog = function () {
      dialog.close();
    };
  });
