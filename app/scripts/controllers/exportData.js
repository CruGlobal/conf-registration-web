'use strict';

angular.module('confRegistrationWebApp')
  .controller('exportDataModal', function ($scope, $modalInstance, conference) {
    $scope.conference = conference;
    $scope.close = function () {
      $modalInstance.close('');
    };
    $scope.submit = function (action) {
      $modalInstance.close(action);
    };
  });