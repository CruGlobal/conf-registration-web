
angular.module('confRegistrationWebApp')
  .controller('registrationModal', function ($scope, $uibModalInstance, $http, $route, conference, primaryRegistration, typeId, uuid, RegistrationCache, modalMessage, validateRegistrant) {
    $scope.conference = conference;
    $scope.form = {
      type: typeId || _.first(conference.registrantTypes).id
    };

    const registrationId = uuid();

    $scope.adminEditRegistrant = {
      id: uuid(),
      registrationId: primaryRegistration ? primaryRegistration.id : registrationId,
      registrantTypeId: $scope.form.type,
      answers: []
    };

    $scope.register = function () {
      $scope.adminEditRegistrant.registrantTypeId = $scope.form.type;
      $scope.adminEditRegistrant.firstName = $scope.form.first;
      $scope.adminEditRegistrant.lastName = $scope.form.last;
      $scope.adminEditRegistrant.email = $scope.form.email;

      const registration = primaryRegistration ?
        primaryRegistration :
        {
          id: registrationId,
          conferenceId: conference.id,
          completed: true,
          registrants: [$scope.adminEditRegistrant]
        };

      const registrantIndex = primaryRegistration ? primaryRegistration.registrants.length : 0;

      if (primaryRegistration) {
        registration.registrants = [...registration.registrants, $scope.adminEditRegistrant];
        registration.groupRegistrants = [...registration.groupRegistrants, $scope.adminEditRegistrant];
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

      if (primaryRegistration) {
        RegistrationCache.update(`registrations/${registration.id}`, registration, function () {
          RegistrationCache.emptyCache();
          $route.reload();
        }, function (response) {
          modalMessage.error(response.data && response.data.error ? response.data.error.message : 'An error occurred while creating registration.');
        });
      } else {
        $http.post(`conferences/${conference.id}/registrations`, registration, {headers: {'Registration-Type': 'on-behalf-of'}})
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

    $scope.blockIsVisible = function(block, registrant){
      return block.type !== 'paragraphContent' && validateRegistrant.blockVisible(block, registrant, true);
    };
  });
