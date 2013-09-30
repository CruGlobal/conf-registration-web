'use strict';

angular.module('confRegistrationWebApp')
  .controller('LoginDialogCtrl', function ($scope, $window, apiUrl) {
    $scope.apiUrl = apiUrl;
    $scope.submit = function (email) {
      $window.location.href = apiUrl + 'auth/none/login?email=' + email;
    };
  });
