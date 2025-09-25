angular
  .module('confRegistrationWebApp')
  .controller(
    'registrationModal',
    function (
      $scope,
      $uibModalInstance,
      $http,
      $route,
      conference,
      primaryRegistration,
      typeId,
      uuid,
      RegistrationCache,
      modalMessage,
      validateRegistrant,
      openedFromGroupModal,
    ) {
      $scope.conference = conference;
      $scope.fromGroupModal = openedFromGroupModal;
      $scope.form = {
        type: typeId || _.first(conference.registrantTypes).id,
      };

      const registrationId = uuid();

      $scope.adminEditRegistrant = {
        id: uuid(),
        registrationId: primaryRegistration
          ? primaryRegistration.id
          : registrationId,
        registrantTypeId: $scope.form.type,
        answers: [],
      };

      // Initialize spouse form
      $scope.spouseForm = {};

      // Watch for changes in registration type to show/hide spouse fields
      $scope.$watch('form.type', function (newTypeId) {
        if (newTypeId) {
          const selectedType = _.find(conference.registrantTypes, {
            id: newTypeId,
          });
          $scope.showSpouseFields =
            selectedType && selectedType.defaultTypeKey === 'COUPLE';

          // Reset spouse form when switching away from couple type
          if (!$scope.showSpouseFields) {
            $scope.spouseForm = {};
          }
        }
      });

      // Helper function to create spouse registrant for couple types
      function createSpouseRegistrant(registrationId) {
        const selectedType = _.find(conference.registrantTypes, {
          id: $scope.form.type,
        });

        const spouseAssociation = selectedType.allowedRegistrantTypeSet[0];

        if (spouseAssociation) {
          const spouseType = _.find(conference.registrantTypes, {
            id: spouseAssociation.childRegistrantTypeId,
          });
          if (spouseType) {
            const groupId = uuid();

            // Set groupId on couple registrant
            $scope.adminEditRegistrant.groupId = groupId;

            return {
              id: uuid(),
              registrationId: primaryRegistration
                ? primaryRegistration.id
                : registrationId,
              registrantTypeId: spouseType.id,
              firstName: $scope.spouseForm.first,
              lastName: $scope.spouseForm.last,
              email: $scope.spouseForm.email,
              groupId: groupId,
              answers: [],
            };
          }
        }
        return null;
      }

      // Helper function to populate profile answers for a registrant
      function populateProfileAnswers(
        registration,
        registrant,
        formData,
        registrantIndex,
      ) {
        angular.forEach(
          _.flatten(_.map(conference.registrationPages, 'blocks')),
          function (block) {
            if (block.profileType === 'EMAIL' || block.profileType === 'NAME') {
              const answer = {
                id: uuid(),
                registrantId: registrant.id,
                blockId: block.id,
              };

              if (block.profileType === 'EMAIL') {
                answer.value = formData.email;
              } else if (block.profileType === 'NAME') {
                answer.value = {
                  firstName: formData.first,
                  lastName: formData.last,
                };
              }

              if (
                registration.registrants[registrantIndex] &&
                registration.registrants[registrantIndex].answers
              ) {
                registration.registrants[registrantIndex].answers.push(answer);
              }
            }
          },
        );
      }

      $scope.register = function () {
        $scope.adminEditRegistrant.registrantTypeId = $scope.form.type;
        $scope.adminEditRegistrant.firstName = $scope.form.first;
        $scope.adminEditRegistrant.lastName = $scope.form.last;
        $scope.adminEditRegistrant.email = $scope.form.email;

        const registration = primaryRegistration
          ? primaryRegistration
          : {
              id: registrationId,
              conferenceId: conference.id,
              completed: true,
              registrants: [$scope.adminEditRegistrant],
            };

        const registrantIndex = primaryRegistration
          ? primaryRegistration.registrants.length
          : 0;

        if (primaryRegistration) {
          registration.registrants = [
            ...registration.registrants,
            $scope.adminEditRegistrant,
          ];
          registration.groupRegistrants = [
            ...registration.groupRegistrants,
            $scope.adminEditRegistrant,
          ];
        }

        // populate registration answers from form
        angular.forEach(
          _.flatten(_.map(conference.registrationPages, 'blocks')),
          function (block) {
            if (block.profileType === 'EMAIL' || block.profileType === 'NAME') {
              var answer = {
                id: uuid(),
                registrantId: registration.id,
                blockId: block.id,
              };

              if (block.profileType === 'EMAIL') {
                answer.value = $scope.form.email;
              } else if (block.profileType === 'NAME') {
                answer.value = {
                  firstName: $scope.form.first,
                  lastName: $scope.form.last,
                };
              }

              registration.registrants[registrantIndex].answers.push(answer);
            }
          },
        );

        if (primaryRegistration) {
          RegistrationCache.update(
            `registrations/${registration.id}`,
            registration,
            function () {
              RegistrationCache.emptyCache();
              $route.reload();
            },
            function (response) {
              modalMessage.error(
                response.data && response.data.error
                  ? response.data.error.message
                  : 'An error occurred while creating registration.',
              );
            },
          );
        } else {
          $http
            .post(`conferences/${conference.id}/registrations`, registration, {
              headers: { 'Registration-Type': 'on-behalf-of' },
            })
            .then(function () {
              // empty cache and reload in order to recognize the newly created registration
              RegistrationCache.emptyCache();
              $route.reload();
            })
            .catch(function (response) {
              modalMessage.error(
                response.data && response.data.error
                  ? response.data.error.message
                  : 'An error occurred while creating registration.',
              );
            });
        }
        $uibModalInstance.dismiss();
      };

      $scope.blockIsVisible = function (block, registrant) {
        return (
          block.type !== 'paragraphContent' &&
          block.profileType !== 'NAME' &&
          block.profileType !== 'EMAIL' &&
          validateRegistrant.blockVisible(block, registrant, true, conference)
        );
      };

      $scope.nonAllowedTypeKeys = ['SPOUSE'];
      $scope.excludeNonAllowedType = function (type) {
        if (type.defaultTypeKey === 'SPOUSE') {
          const coupleTypes = _.filter(conference.registrantTypes, {
            defaultTypeKey: 'COUPLE',
          });

          if (!coupleTypes.length) {
            return true;
          }

          // Check if this spouse is associated with any couple
          const spouseIsAssociated = coupleTypes.some((coupleType) => {
            if (!coupleType.allowedRegistrantTypeSet) {
              return false;
            }

            const hasAssociation = coupleType.allowedRegistrantTypeSet.some(
              (association) => {
                const isMatch = association.childRegistrantTypeId === type.id;

                const hasChildRegistrants =
                  association.numberOfChildRegistrants &&
                  association.numberOfChildRegistrants > 0;

                return isMatch && hasChildRegistrants;
              },
            );
            return hasAssociation;
          });
          return !spouseIsAssociated;
        }

        return $scope.nonAllowedTypeKeys.indexOf(type.defaultTypeKey) === -1;
      };
    },
  );
