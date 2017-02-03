'use strict';

angular.module('confRegistrationWebApp')
  .controller('exportDataModal', function ($scope, $modalInstance, $cookies, conference, envService) {
    $scope.conference = conference;
    $scope.apiUrl = envService.read('apiUrl');
    $scope.authToken = $cookies.crsToken;

    $scope.close = function () {
      $modalInstance.dismiss();
    };
  });
