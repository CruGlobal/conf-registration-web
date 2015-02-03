'use strict';

angular.module('confRegistrationWebApp')
  .controller('editRegistrationModalCtrl', function ($scope, $modalInstance, $http, conference, registrant, registration) {
    $scope.conference = angular.copy(conference);
    $scope.registration = angular.copy(registration);
    $scope.adminEditRegistration = _.find($scope.registration.registrants, { 'id': registrant.id });
    $scope.saving = false;
    var answersToUpdate = [];

    $scope.close = function () {
      $modalInstance.dismiss();
    };

    $scope.blockInRegType = function(block, regTypeId){
      return !_.contains(block.registrantTypes, regTypeId);
    };

    $scope.submit = function (setRegistrationAsCompleted) {
      $scope.saving = true;

      angular.forEach($scope.adminEditRegistration.answers, function(a){
        if(!angular.equals(a, _.find(registrant.answers, { 'id': a.id }))){
          answersToUpdate.push(a);
        }
      });

      if(setRegistrationAsCompleted){
        var r = confirm('Are you sure you want to mark this registration as completed?');
        if (!r) {
          $scope.saving = false;
          return;
        }
        $scope.registration.completed = true;
        $http.put('registrations/' + registrant.registrationId, $scope.registration).success(function(){
          saveAnswer();
        });
      }else{
        $http.put('registrations/' + registrant.registrationId, $scope.registration).success(function(){
          saveAnswer();
        });
      }
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
