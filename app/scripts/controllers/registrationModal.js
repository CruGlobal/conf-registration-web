'use strict';

angular.module('confRegistrationWebApp')
  .controller('registrationModal', function ($scope, $modalInstance, $http, $route, conference, uuid, RegistrationCache) {

    $scope.form = {};

    $scope.register = function () {
      // build registration
      var registration = {};
      registration.id = uuid();
      registration.conferenceId = conference.id;
      registration.completed = true;
      registration.answers = [];
      registration.pastPayments = [];

      // populate registration answers from form
      angular.forEach(conference.registrationPages, function (registrationPage) {
        angular.forEach(registrationPage.blocks, function (block) {
          if (block.profileType === 'EMAIL' || block.profileType === 'NAME') {
            var answer = {
              id: uuid(),
              registrationId: registration.id,
              blockId: block.id,
              value: {}
            };

            if (block.profileType === 'EMAIL') {
              answer.value = $scope.form.email;
            } else if (block.profileType === 'NAME') {
              answer.value = { firstName: $scope.form.first, lastName: $scope.form.last };
            }

            registration.answers.push(answer);
          }
        });
      });

      $http.post('conferences/' + conference.id + '/registrations', registration, {headers: {'Registration-Type': 'on-behalf-of'}})
        .success(function () {
          // empty cache and reload in order to recognize the newly created registration
          RegistrationCache.emptyCache();
          $route.reload();
        })
        .error(function (data) {
          console.log('Error: ' + data);
        });

      $modalInstance.close();
    };

    $scope.close = function () {
      $modalInstance.close();
    };
  });