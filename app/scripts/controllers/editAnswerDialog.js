'use strict';

angular.module('confRegistrationWebApp')
  .controller('EditAnswerDialogCtrl', function ($scope, $modalInstance) {
	  $scope.originalAnswer = angular.copy($scope.answer);
    $scope.close = function () {
      $scope.$parent.answer = angular.copy($scope.originalAnswer);
      $modalInstance.close('');
    };

    $scope.submit = function () {
      $modalInstance.close();
    };
  });