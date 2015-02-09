'use strict';

angular.module('confRegistrationWebApp')
  .controller('editRegistrationModalCtrl', function ($scope, $modalInstance, $http, conference, registrantId, registration) {
    $scope.conference = angular.copy(conference);
    $scope.registration = angular.copy(registration);
    $scope.adminEditRegistrant = _.find($scope.registration.registrants, { 'id': registrantId });
    var originalRegistrantObject = angular.copy($scope.adminEditRegistrant);
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

      angular.forEach($scope.adminEditRegistrant.answers, function(a){
        if(!angular.equals(a, _.find(originalRegistrantObject.answers, { 'id': a.id }))){
          answersToUpdate.push(a);
        }
      });

      if(setRegistrationAsCompleted){
        if (!confirm('Are you sure you want to mark this registration as completed?')) {
          $scope.saving = false;
          return;
        }
        $scope.registration.completed = true;
        $http.put('registrations/' + originalRegistrantObject.registrationId, $scope.registration).success(function(){
          saveAnswer();
        });
      }else{
        //check if registrant type has been changed
        if(originalRegistrantObject.registrantTypeId !== $scope.adminEditRegistrant.registrantTypeId){
          $http.put('registrations/' + originalRegistrantObject.registrationId, $scope.registration).success(function(){
            saveAnswer();
          });
        }else{
          saveAnswer();
        }
      }
    };

    var saveAnswer = function(){
      if(answersToUpdate.length){
        var a = _.first(answersToUpdate);
        answersToUpdate.shift();
        $http.put('answers/' + a.id, a).success(saveAnswer);
      }else{
        //complete
        $http.get('registrations/' + originalRegistrantObject.registrationId).success(function(registration){
          $modalInstance.close(registration);
        });
      }
    };
  });
