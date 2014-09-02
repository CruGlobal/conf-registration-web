'use strict';

angular.module('confRegistrationWebApp')
  .controller('registrationModal', function ($scope, $modalInstance, $http, $route, conference, uuid, RegistrationCache) {

    $scope.form = {};

    $scope.register = function () {
      // build registration
      var registrationId = uuid();
      var registration = {
        id: registrationId,
        conferenceId: conference.id,
        completed: true,
        registrants: [{
          id: uuid(),
          registrationId: registrationId,
          answers: []
        }]
      };

      // populate registration answers from form
      angular.forEach(_.flatten(conference.registrationPages, 'blocks'), function (block) {
        if (block.profileType === 'EMAIL' || block.profileType === 'NAME') {
          var answer = {
            id: uuid(),
            registrantId: registration.id,
            blockId: block.id
          };

          if (block.profileType === 'EMAIL') {
            answer.value = $scope.form.email;
          } else if (block.profileType === 'NAME') {
            answer.value = { firstName: $scope.form.first, lastName: $scope.form.last };
          }

          registration.registrants[0].answers.push(answer);
        }
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