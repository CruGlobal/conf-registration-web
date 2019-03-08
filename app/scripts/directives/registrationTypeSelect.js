import template from 'views/components/registrationTypeSelect.html';

angular.module('confRegistrationWebApp')
  .directive('registrationTypeSelect', function () {
    return {
      templateUrl: template,
      restrict: 'E',
      controller: function ($scope, $rootScope, $location, $routeParams, RegistrationCache, uuid, modalMessage) {

        $scope.visibleRegistrantTypes = angular.copy($scope.conference.registrantTypes);

        const findCurrentGroupRegistrantType = function() {
          const registrants = $scope.currentRegistration.registrants;
          for (let i = 0; i < registrants.length; i++) {
            const registrationType = _.find($scope.conference.registrantTypes, {'id': registrants[i].registrantTypeId});
            if (registrationType.allowGroupRegistrations) {
              return registrationType;
            }
          }
          return null;
        };

        var visibleType = $routeParams.regType;
        if(angular.isDefined(visibleType)){
          if(_.isEmpty($scope.currentRegistration.registrants)){
            _.remove($scope.visibleRegistrantTypes, function(t) { return t.id !== visibleType; });
          }
        } else {
          _.remove($scope.visibleRegistrantTypes, function(t) {
            //remove if type is marked as hidden and a registrant with this type doesn't already exist in the registration
            return t.hidden && !_.includes(_.map($scope.currentRegistration.registrants, 'registrantTypeId'), t.id);
          });

          //remove sub registrant types
          if(_.isEmpty($scope.currentRegistration.registrants)){
            _.remove($scope.visibleRegistrantTypes, function(t) { return t.groupSubRegistrantType; });
          }

          // if the current registration is a group registration, show only associated non-group registrant types within the limit
          const groupRegistrantType = findCurrentGroupRegistrantType();
          $scope.isGroupRegistration = groupRegistrantType !== null;
          if ($scope.isGroupRegistration && groupRegistrantType.allowedRegistrantTypeSet != null) {
            const currentCounts = _.countBy($scope.currentRegistration.registrants, 'registrantTypeId');
            _.remove($scope.visibleRegistrantTypes, (t) => {
              const childRegistrantType = _.find(groupRegistrantType.allowedRegistrantTypeSet, {childRegistrantTypeId: t.id});
              return !childRegistrantType ||
                (childRegistrantType.numberOfChildRegistrants !== 0 && currentCounts[childRegistrantType.childRegistrantTypeId] >= childRegistrantType.numberOfChildRegistrants);
            });
          }
        }

        $scope.newRegistrant = function(type){
          var newId = uuid();
          $scope.currentRegistration.registrants.push({
            id: newId,
            registrationId: $scope.currentRegistration.id,
            registrantTypeId: type,
            answers: []
          });
          RegistrationCache.update('registrations/' + $scope.currentRegistration.id, $scope.currentRegistration, function () {
            RegistrationCache.emptyCache();
            $location.path(($rootScope.registerMode || 'register') + '/' + $scope.conference.id + '/page/' + $scope.conference.registrationPages[0].id).search('reg', newId);
          }, function(){
            modalMessage.error({
              'title': 'Error',
              'message': 'An error occurred while updating your registration.'
            });
          });
        };

        $scope.registrationTypeFull = function(type){
          if(!type.useLimit){
            return false;
          }
          if(!type.availableSlots){
            return true;
          }

          //subtract registrants from current registration from availableSlots
          if(type.availableSlots - _.filter($scope.currentRegistration.registrants, { 'registrantTypeId': type.id }).length <= 0){
            return true;
          }
        };
      }
    };
  });
