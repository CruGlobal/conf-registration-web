'use strict';

angular.module('confRegistrationWebApp')
  .controller('LoginDialogCtrl', function ($scope, ConfCache, dialog, apiUrl) {
    $scope.apiUrl = apiUrl;
    $scope.submit = function () {
      dialog.close();
      // take the user somewhere, this will be for @hlbraddock
    };
    $scope.closeDialog = function () {
      dialog.close();
    };
  });
