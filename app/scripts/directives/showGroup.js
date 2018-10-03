import template from 'views/components/showGroup.html';

angular.module('confRegistrationWebApp')
  .component('showGroup', {
    templateUrl: template,
    bindings: {
      modalInstance: '<',
      resolve: '<'
    },
    controller: [function(){
      var $ctrl = this;

      $ctrl.$onInit = function() {
        $ctrl.groupName = $ctrl.resolve.groupName;
        $ctrl.registrationId = $ctrl.resolve.registrationId;
        $ctrl.conference = $ctrl.resolve.conference;
        $ctrl.getRegistration = $ctrl.resolve.getRegistration;
        $ctrl.getRegistrantType = $ctrl.resolve.getRegistrantType;
        $ctrl.editRegistrant = $ctrl.resolve.editRegistrant;
        $ctrl.deleteRegistrant = $ctrl.resolve.deleteRegistrant;
        $ctrl.registerUser = $ctrl.resolve.registerUser;

        $ctrl.visibleRegistrantTypes = angular.copy($ctrl.conference.registrantTypes);

        const registration = $ctrl.getRegistration($ctrl.registrationId);

        _.remove($ctrl.visibleRegistrantTypes, function(registrantType) {
          //remove if type is marked as hidden and a registrant with this type doesn't already exist in the registration
          return registrantType.hidden && !_.includes(_.map(registration.registrants, 'registrantTypeId'), registrantType.id);
        });
      };

      $ctrl.close = function() {
        $ctrl.modalInstance.dismiss();
      };

      $ctrl.register = function(typeId) {
        $ctrl.registerUser($ctrl.getRegistration($ctrl.registrationId), typeId);
      };

      $ctrl.registrationTypeFull = function(type){
        if(!type.useLimit){
          return false;
        }
        if(!type.availableSlots){
          return true;
        }

        const registration = $ctrl.getRegistration($ctrl.registrationId);

        // subtract currentRegistration's registrants from availableSlots. if there's no slot left, return true
        return type.availableSlots <= _.filter(registration.registrants, { 'registrantTypeId': type.id }).length;
      };
    }]
  });
