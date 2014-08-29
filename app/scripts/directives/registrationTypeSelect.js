'use strict';

angular.module('confRegistrationWebApp')
  .directive('registrationTypeSelect', function () {
    return {
      templateUrl: 'views/components/registrationTypeSelect.html',
      restrict: 'E',
      controller: function ($scope, RegistrationCache, uuid) {
        $scope.newRegistrant = function(type){
          var newId = uuid();
          $scope.currentRegistration.registrants.push({
            id: newId,
            registrationId: $scope.currentRegistration.id,
            registrantTypeId: type
            //answers: {}
          });
          RegistrationCache.update('registrations/' + $scope.currentRegistration.id, $scope.currentRegistration, function () {
            console.log(data);
            $location.path($rootScope.registerMode + '/' + conference.id + '/page/' + conference.registrationPages[0].id).search('reg', newId);
          }, function (data) {
            console.log(data);
          });
        };
      }
    };
  });
