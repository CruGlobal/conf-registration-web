import template from 'views/components/registrationTypeSelect.html';

angular
  .module('confRegistrationWebApp')
  .directive('registrationTypeSelect', function () {
    return {
      templateUrl: template,
      restrict: 'E',
      controller: function (
        $scope,
        $rootScope,
        $location,
        $routeParams,
        RegistrationCache,
        uuid,
        modalMessage,
      ) {
        $scope.visibleRegistrantTypes = angular.copy(
          $scope.conference.registrantTypes,
        );

        const findCurrentGroupRegistrantType = function (
          registrants,
          registrantTypes,
        ) {
          const registrantTypeIds = registrants.map(
            ({ registrantTypeId }) => registrantTypeId,
          );
          return _.find(
            registrantTypes,
            ({ allowGroupRegistrations, id }) =>
              allowGroupRegistrations && _.includes(registrantTypeIds, id),
          );
        };

        var visibleType = $routeParams.regType;
        if (angular.isDefined(visibleType)) {
          if (_.isEmpty($scope.currentRegistration.registrants)) {
            _.remove($scope.visibleRegistrantTypes, function (t) {
              return t.id !== visibleType;
            });
          }
        } else {
          _.remove($scope.visibleRegistrantTypes, function (t) {
            //remove if type is marked as hidden and a registrant with this type doesn't already exist in the registration
            return (
              t.hidden &&
              !_.includes(
                _.map(
                  $scope.currentRegistration.registrants,
                  'registrantTypeId',
                ),
                t.id,
              )
            );
          });

          //remove sub registrant types
          if (_.isEmpty($scope.currentRegistration.registrants)) {
            _.remove($scope.visibleRegistrantTypes, function (t) {
              return t.groupSubRegistrantType;
            });
          }

          // if: the current registration has already a group registration
          // then: narrow down visible registrant types to configured allowed registrant types (according to the limit)
          // otherwise: show all (happens at the beginning of the registration
          // and if selected group registrant type has no associated registrant types)
          const groupRegistrantType = findCurrentGroupRegistrantType(
            $scope.currentRegistration.registrants,
            $scope.conference.registrantTypes,
          );
          $scope.isGroupRegistration = groupRegistrantType !== undefined;
          if (
            $scope.isGroupRegistration &&
            groupRegistrantType.allowedRegistrantTypeSet != null
          ) {
            const currentCounts = _.countBy(
              $scope.currentRegistration.registrants,
              'registrantTypeId',
            );
            _.remove($scope.visibleRegistrantTypes, (t) => {
              const childRegistrantType = _.find(
                groupRegistrantType.allowedRegistrantTypeSet,
                { childRegistrantTypeId: t.id },
              );
              return (
                !childRegistrantType ||
                (childRegistrantType.numberOfChildRegistrants !== 0 &&
                  currentCounts[childRegistrantType.childRegistrantTypeId] >=
                    childRegistrantType.numberOfChildRegistrants)
              );
            });
          }
        }

        $scope.newRegistrant = function (type) {
          var newId = uuid();
          // Filter through all pages and remove any empty pages
          const validPages = $scope.conference.registrationPages.filter(
            (page) =>
              page.blocks.filter(
                (block) => !block.registrantTypes.includes(type),
              ).length > 0,
          );

          $scope.currentRegistration.registrants.push({
            id: newId,
            registrationId: $scope.currentRegistration.id,
            registrantTypeId: type,
            answers: [],
          });
          RegistrationCache.update(
            'registrations/' + $scope.currentRegistration.id,
            $scope.currentRegistration,
            function () {
              RegistrationCache.emptyCache();
              $location
                .path(
                  ($rootScope.registerMode || 'register') +
                    '/' +
                    $scope.conference.id +
                    '/page/' +
                    validPages[0].id,
                )
                .search('reg', newId);
            },
            function () {
              modalMessage.error({
                title: 'Error',
                message: 'An error occurred while updating your registration.',
              });
            },
          );
        };

        $scope.registrationTypeFull = function (type) {
          if (!type.useLimit) {
            return false;
          }
          if (!type.availableSlots) {
            return true;
          }

          //subtract registrants from current registration from availableSlots
          if (
            type.availableSlots -
              _.filter($scope.currentRegistration.registrants, {
                registrantTypeId: type.id,
              }).length <=
            0
          ) {
            return true;
          }
        };

        $scope.nonAllowedTypeKeys = ['SPOUSE'];
        $scope.excludeNonAllowedType = function (type) {
          if (!$scope.shouldFilterSpouses) {
            return true;
          }
          if (type.defaultTypeKey === 'SPOUSE') {
            // Fix: Use $scope.conference.registrantTypes instead of $scope.current.registrantTypes
            const coupleTypes = _.filter($scope.conference.registrantTypes, {
              defaultTypeKey: 'COUPLE',
            });

            // Check if this spouse is associated with any couple
            const spouseIsAssociated = coupleTypes.some((coupleType) => {
              if (
                !coupleType.allowedRegistrantTypeSet ||
                coupleType.allowedRegistrantTypeSet.length === 0
              ) {
                return false;
              }

              const hasAssociation = coupleType.allowedRegistrantTypeSet.some(
                (association) => {
                  const isMatch = association.childRegistrantTypeId === type.id;
                  const hasChildRegistrants =
                    association.numberOfChildRegistrants > 0;

                  return isMatch && hasChildRegistrants;
                },
              );
              return hasAssociation;
            });

            return !spouseIsAssociated;
          }

          return true;
        };
      },
    };
  });
