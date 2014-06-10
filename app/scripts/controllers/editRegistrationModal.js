'use strict';

angular.module('confRegistrationWebApp')
  .controller('editRegistrationModalCtrl', function ($scope, $modalInstance, $http, registration, conference) {
    $scope.conference = conference;
    $scope.adminEditRegistration = angular.copy(registration);
    $scope.saving = false;

    $scope.close = function () {
      $modalInstance.close();
    };

    $scope.submit = function () {
      $scope.saving = true;
      $http.put('registrations/' + registration.id, $scope.adminEditRegistration).then(function () {
        $modalInstance.close($scope.adminEditRegistration);
      },
      function (data) {
        alert('Error: \n\n' + data.data);
        $modalInstance.close();
      });
    };
  });