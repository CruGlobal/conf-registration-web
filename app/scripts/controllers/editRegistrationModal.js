
angular.module('confRegistrationWebApp')
  .controller('editRegistrationModalCtrl', function ($scope, $uibModalInstance, modalMessage, $http, $q, conference, registrantId, registration, validateRegistrant) {
    $scope.conference = angular.copy(conference);
    $scope.registration = angular.copy(registration);
    $scope.adminEditRegistrant = _.find($scope.registration.registrants, { 'id': registrantId });
    var originalRegistrantObject = angular.copy($scope.adminEditRegistrant);
    $scope.saving = false;

    $scope.close = function () {
      $uibModalInstance.dismiss();
    };

    $scope.blockIsVisible = function(block, registrant){
      return block.type !== 'paragraphContent' && validateRegistrant.blockVisible(block, registrant, true);
    };

    $scope.submit = function (setRegistrationAsCompleted) {
      $scope.saving = true;

      if(setRegistrationAsCompleted){
        modalMessage.confirm({
          'title': 'Mark as completed?',
          'question': 'Are you sure you want to mark this registration as completed?'
        }).then(function(){
          $scope.registration.completed = true;
          saveAllAnswers();
        },
        function(){
          $scope.saving = false;
        });
      }else if(originalRegistrantObject.registrantTypeId !== $scope.adminEditRegistrant.registrantTypeId){ //check if registrant type has been changed
        saveAllAnswers();
      }else{
        //PUT individual answers
        var answersUpdatePromises = [];
        angular.forEach($scope.adminEditRegistrant.answers, function(a){
          if(!angular.equals(a, _.find(originalRegistrantObject.answers, { 'id': a.id }))){
            answersUpdatePromises.push($http.put('answers/' + a.id, a));
          }
        });
        $q.all(answersUpdatePromises).then(getRegistrantAndClose);
      }
    };

    function saveAllAnswers() {
      $http.put('registrations/' + originalRegistrantObject.registrationId, $scope.registration).then(getRegistrantAndClose).catch(function(response){
        $scope.saving = false;
        modalMessage.error(response.data && response.data.error ? response.data.error.message : 'An error occurred while saving this registration.');
      });
    }

    function getRegistrantAndClose(){
      $http.get('registrations/' + originalRegistrantObject.registrationId).then(function (response) {
        var registration = response.data;
        $uibModalInstance.close(registration);
      });
    }
  });
