'use strict';

angular.module('confRegistrationWebApp')
  .directive('registrationTypeSelect', function () {
    return {
      templateUrl: 'views/components/registrationTypeSelect.html',
      restrict: 'E',
      controller: function ($scope, $rootScope, $location, $routeParams, RegistrationCache, uuid) {
        $scope.visibleRegistrantTypes = angular.copy($scope.conference.registrantTypes);

        var visibleType = $routeParams.regType;
        if(angular.isDefined(visibleType)){
          _.remove($scope.visibleRegistrantTypes, function(t) { return t.id !== visibleType; });
        } else {
          _.remove($scope.visibleRegistrantTypes, function(t) { return t.hidden; });
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
          });
        };

        $scope.isConferenceCost = function () {
          return _.max(_.flatten($scope.conference.registrantTypes, 'cost')) > 0;
        };
      }
    };
  });
