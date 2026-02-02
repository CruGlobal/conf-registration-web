import template from 'views/components/registrationTypeSelect.html';
import { isCoupleType } from '../utils/coupleTypeUtils';

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

        const getRegistrantType = (id) =>
          _.find($scope.conference.registrantTypes, { id });

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
              $scope.currentRegistration.registrants.filter(
                (registrant) =>
                  registrant.id !==
                  $scope.currentRegistration.primaryRegistrantId,
              ),
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

        // Check whether conference and registration-type limits allow another registrant of the
        // specified type to register
        $scope.registrationTypeFull = function (type) {
          const numNewRegistrants = isCoupleType(type) ? 2 : 1;

          // Type level limit should take precedence over conference limit
          const registrantsOfType = _.filter(
            $scope.currentRegistration.registrants,
            { registrantTypeId: type.id },
          ).length;
          if (
            type.useLimit &&
            type.availableSlots < registrantsOfType + numNewRegistrants
          ) {
            return true;
          }

          // Exempt types skip the conference capacity check
          if (type.exemptFromConferenceCapacity) {
            return false;
          }

          // Count how many registrants are exempt from conference capacity limits
          // to exclude them from the total count
          const exemptCount = $scope.currentRegistration.registrants.filter(
            (registrant) => {
              const registrantType = getRegistrantType(
                registrant.registrantTypeId,
              );
              return registrantType?.exemptFromConferenceCapacity;
            },
          ).length;
          const registrants = $scope.currentRegistration.registrants.length;

          const totalRegistrants =
            registrants + numNewRegistrants - exemptCount;

          // If the total registrants of the current registration including the new
          // one(s) would exceed the conference's available capacity, the registration is full
          if (
            $scope.conference.useTotalCapacity &&
            totalRegistrants > $scope.conference.availableCapacity
          ) {
            return true;
          }

          return false;
        };
      },
    };
  });
