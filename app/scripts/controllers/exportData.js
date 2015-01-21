'use strict';

angular.module('confRegistrationWebApp')
  .controller('exportDataModal', function ($scope, $modalInstance, $cookies, conference, apiUrl, hasCost) {
    $scope.conference = conference;
    $scope.apiUrl = apiUrl;
    $scope.authToken = $cookies.crsToken;
    $scope.hasCost = hasCost;

    $scope.close = function () {
      $modalInstance.close('');
    };
  });
