'use strict';

angular.module('confRegistrationWebApp')
  .controller('exportDataModal', function ($scope, $modalInstance, $cookies, conference, apiUrl) {
    $scope.conference = conference;
    $scope.apiUrl = apiUrl;
    $scope.authToken = $cookies.crsToken;

    $scope.close = function () {
      $modalInstance.dismiss();
    };
  });
