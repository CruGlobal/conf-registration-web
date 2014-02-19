angular.module('confRegistrationWebApp')
  .controller('genericModal', function ($scope, $modalInstance, data) {
    $scope.data = data;
    $scope.close = function () {
      $modalInstance.close('');
    };
  });