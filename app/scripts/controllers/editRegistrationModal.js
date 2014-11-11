'use strict';

angular.module('confRegistrationWebApp')
  .controller('editRegistrationModalCtrl', function ($scope, $modalInstance, $http, conference, registrant, registration) {
    $scope.conference = conference;
    $scope.adminEditRegistration = angular.copy(registrant);
    $scope.registration = angular.copy(registration);
    $scope.saving = false;
    var answersToUpdate = [];

    $scope.close = function () {
      $modalInstance.dismiss();
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
        saveAnswer();
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