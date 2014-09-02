'use strict';

angular.module('confRegistrationWebApp')
  .directive('registrationTypeSelect', function () {
    return {
      templateUrl: 'views/components/registrationTypeSelect.html',
      restrict: 'E',
      controller: function ($scope, $rootScope, $location, RegistrationCache, uuid) {
        $scope.newRegistrant = function(type){
          var newId = uuid();
          $scope.currentRegistration.registrants.push({
            id: newId,
            registrationId: $scope.currentRegistration.id,
            registrantTypeId: type
          });
          RegistrationCache.update('registrations/' + $scope.currentRegistration.id, $scope.currentRegistration, function () {
            RegistrationCache.emptyCache();
            $location.path($rootScope.registerMode + '/' + $scope.conference.id + '/page/' + $scope.conference.registrationPages[0].id).search('reg', newId);
          }, function (data) {
            console.log(data);
          });
        };

        $scope.isConferenceCost = function () {
          return _.max(_.flatten($scope.conference.registrantTypes, 'cost')) > 0;
        };
      }
    };
  });
