'use strict';

angular.module('confRegistrationWebApp')
  .controller('LoginDialogCtrl', function ($scope, $window, apiUrl) {
    $scope.apiUrl = apiUrl;
    $scope.submit = function () {
      $window.location.href = apiUrl + 'auth/none/login?email=' + $scope.email;
    };
  });
