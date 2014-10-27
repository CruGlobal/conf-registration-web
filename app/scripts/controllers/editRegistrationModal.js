'use strict';

angular.module('confRegistrationWebApp')
  .controller('editRegistrationModalCtrl', function ($scope, $modalInstance, $http, registrant, conference) {
    $scope.conference = conference;
    $scope.adminEditRegistration = angular.copy(registrant);
    $scope.saving = false;
    var answersToUpdate = [];

    $scope.close = function () {
      $modalInstance.close();
    };

    $scope.submit = function () {
      $scope.saving = true;

      angular.forEach($scope.adminEditRegistration.answers, function(a){
        if(!angular.equals(a, _.find(registrant.answers, { 'id': a.id }))){
          answersToUpdate.push(a);
        }
      });

      saveAnswer();
    };

    var saveAnswer = function(){
      if(answersToUpdate.length){
        var a = _.first(answersToUpdate);
        answersToUpdate.shift();
        $http.put('answers/' + a.id, a).success(saveAnswer);
      }else{
        //complete
        $http.get('registrations/' + registrant.registrationId).success(function(registration){
          $modalInstance.close(registration);
        });
      }
    };
  });