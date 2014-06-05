'use strict';

angular.module('confRegistrationWebApp')
.controller('confirmCtrl', function ($scope, ConfCache, $modalInstance) {
  $scope.close = function () {
    $modalInstance.close(false);
  };
  $scope.submit = function () {
    $modalInstance.close(true);
  };
});

angular.module('confRegistrationWebApp')
.controller('confirmPromptCtrl', function ($scope, $modalInstance) {
  $scope.close = function () {
    $modalInstance.close('');
  };
  $scope.submit = function (newPageName) {
    $modalInstance.close(newPageName);
  };
});