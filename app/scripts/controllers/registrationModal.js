
angular.module('confRegistrationWebApp')
  .controller('registrationModal', function ($scope, $uibModalInstance, $http, $route, conference, uuid, RegistrationCache, modalMessage) {
    $scope.conference = conference;
    $scope.form = {
      type: _.first(conference.registrantTypes).id
    };

    $scope.register = function () {
      // build registration
      var registrationId = uuid();
      var registration = {
        id: registrationId,
        conferenceId: conference.id,
        completed: true,
        registrants: [{
          id: uuid(),
          registrantTypeId: $scope.form.type,
          registrationId: registrationId,
          firstName: $scope.form.first,
          lastName: $scope.form.last,
          email: $scope.form.email,
          answers: []
        }]
      };

      // populate registration answers from form
      angular.forEach(_.flatten(_.map(conference.registrationPages, 'blocks')), function (block) {
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
        .then(function () {
          // empty cache and reload in order to recognize the newly created registration
          RegistrationCache.emptyCache();
          $route.reload();
        })
        .catch(function (response) {
          modalMessage.error(response.data && response.data.error ? response.data.error.message : 'An error occurred while creating registration.');
        });
      $uibModalInstance.dismiss();
    };
  });
