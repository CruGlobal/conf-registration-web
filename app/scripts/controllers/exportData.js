'use strict';

angular.module('confRegistrationWebApp')
  .controller('exportDataModal', function ($scope, $modalInstance, conference, hasCost) {
    $scope.conference = conference;
    $scope.hasCost = hasCost;
    $scope.close = function () {
      $modalInstance.close('');
    };
    $scope.submit = function (action) {
      $modalInstance.close(action);
    };
  });