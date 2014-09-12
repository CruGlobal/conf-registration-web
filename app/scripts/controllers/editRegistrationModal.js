'use strict';

angular.module('confRegistrationWebApp')
  .controller('editRegistrationModalCtrl', function ($scope, $modalInstance, $http, registrant, conference) {
    $scope.conference = conference;
    $scope.adminEditRegistration = angular.copy(registrant);
    $scope.saving = false;

    $scope.close = function () {
      $modalInstance.close();
    };

    $scope.submit = function () {
      $scope.saving = true;

      angular.forEach($scope.adminEditRegistration.answers, function(a){
        if(!angular.equals(a, _.find(registrant.answers, { 'id': a.id }))){
          $http.put('answers/' + a.id, a);
        }
      });
      $modalInstance.close($scope.adminEditRegistration);
    };
  });