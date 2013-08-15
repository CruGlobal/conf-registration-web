'use strict';

angular.module('confRegistrationWebApp')
  .controller('LoginDialogCtrl', function ($scope, ConfCache, dialog, $location) {
    $scope.submit = function () {
        dialog.close();
    };
  });
