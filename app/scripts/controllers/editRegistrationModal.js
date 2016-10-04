'use strict';

angular.module('confRegistrationWebApp')
  .controller('editRegistrationModalCtrl', function ($scope, $modalInstance, modalMessage, $http, $q, conference, registrantId, registration, validateRegistrant) {
    $scope.editRegistration = {};
    $scope.conference = angular.copy(conference);
    $scope.registration = angular.copy(registration);
    $scope.adminEditRegistrant = _.find($scope.registration.registrants, { 'id': registrantId });
    var originalRegistrantObject = angular.copy($scope.adminEditRegistrant);
    $scope.saving = false;

    $scope.close = function () {
      $modalInstance.dismiss();
    };

    $scope.blockIsVisible = function (block, registrant) {
      return block.type !== 'paragraphContent' && validateRegistrant.blockVisible(block, registrant, true);
    };

    $scope.submit = function (setRegistrationAsCompleted) {
      if (!$scope.editRegistration.form.$valid && ($scope.editRegistration.form.$error.max || $scope.editRegistration.form.$error.min)) { return; }
      $scope.saving = true;

      if (setRegistrationAsCompleted) {
        modalMessage.confirm({
          'title': 'Mark as completed?',
          'question': 'Are you sure you want to mark this registration as completed?'
        }).then(function () {
          $scope.registration.completed = true;
          saveAllAnswers();
        },
          function () {
            $scope.saving = false;
          });
      } else if (originalRegistrantObject.registrantTypeId !== $scope.adminEditRegistrant.registrantTypeId) { //check if registrant type has been changed
        saveAllAnswers();
      } else {
        //PUT individual answers
        var answersUpdatePromises = [];
        angular.forEach($scope.adminEditRegistrant.answers, function (a) {
          if (!angular.equals(a, _.find(originalRegistrantObject.answers, { 'id': a.id }))) {
            answersUpdatePromises.push($http.put('answers/' + a.id, a));
          }
        });
        $q.all(answersUpdatePromises).then(getRegistrantAndClose);
      }
    };

    var saveAllAnswers = function () {
      $http.put('registrations/' + originalRegistrantObject.registrationId, $scope.registration).success(getRegistrantAndClose).error(function (data) {
        $scope.saving = false;
        modalMessage.error(data.error ? data.error.message : 'An error occurred while saving this registration.');
      });
    };

    var getRegistrantAndClose = function () {
      $http.get('registrations/' + originalRegistrantObject.registrationId).success(function (registration) {
        $modalInstance.close(registration);
      });
    };
  });
