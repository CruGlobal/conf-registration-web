
angular.module('confRegistrationWebApp')
  .controller('showGroupModalCtrl', function($scope, conference, currentRegistration, registrationId){
    $scope.currentRegistration = currentRegistration;
    $scope.registrationId = registrationId;
    $scope.conference = angular.copy(conference);

    $scope.visibleRegistrantTypes = angular.copy($scope.conference.registrantTypes);

    _.remove($scope.visibleRegistrantTypes, function(registrantType) {
      //remove if type is marked as hidden and a registrant with this type doesn't already exist in the registration
      return registrantType.hidden && !_.includes(_.map($scope.currentRegistration.registrants, 'registrantTypeId'), registrantType.id);
    });

    $scope.registrationTypeFull = function(type){
      if(!type.useLimit){
        return false;
      }
      if(!type.availableSlots){
        return true;
      }

      // subtract currentRegistration's registrants from availableSlots. if there's no slot left, return true
      if(type.availableSlots - _.filter($scope.currentRegistration.registrants, { 'registrantTypeId': type.id }).length <= 0){
        return true;
      }

      return false;
    };
  });