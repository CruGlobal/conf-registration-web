
angular.module('confRegistrationWebApp')
  .controller('registrationModal', function ($scope, $uibModalInstance, $http, $route, conference, primaryRegistration, uuid, RegistrationCache, modalMessage) {
    $scope.conference = conference;
    $scope.form = {
      type: _.first(conference.registrantTypes).id
    };

    $scope.register = function () {
      var registration;
      var registrant = {
        id: uuid(),
        registrantTypeId: $scope.form.type,
        firstName: $scope.form.first,
        lastName: $scope.form.last,
        email: $scope.form.email,
        answers: []
      };
      var registrantIndex = 0;

      if (angular.isDefined(primaryRegistration) && primaryRegistration !== null) {
        registration = primaryRegistration;

        registrant.registrationId = registration.id;

        registrantIndex = registration.registrants.length;
        registration.registrants.push(registrant);
      } else {
        // build registration
        var registrationId = uuid();
        registrant.registrationId = registrationId;

        registration = {
          id: registrationId,
          conferenceId: conference.id,
          completed: true,
          registrants: [registrant]
        };
      }

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

          registration.registrants[registrantIndex].answers.push(answer);
        }
      });

      if (angular.isDefined(primaryRegistration) && primaryRegistration !== null) {
        RegistrationCache.update('registrations/' + registration.id, registration, function () {
          RegistrationCache.emptyCache();
          $route.reload();
        }, function (response) {
          modalMessage.error(response.data && response.data.error ? response.data.error.message : 'An error occurred while creating registration.');
        });
      } else {
        $http.post('conferences/' + conference.id + '/registrations', registration, {headers: {'Registration-Type': 'on-behalf-of'}})
          .then(function () {
            // empty cache and reload in order to recognize the newly created registration
            RegistrationCache.emptyCache();
            $route.reload();
          })
          .catch(function (response) {
            modalMessage.error(response.data && response.data.error ? response.data.error.message : 'An error occurred while creating registration.');
          });
      }
      $uibModalInstance.dismiss();
    };
  });
