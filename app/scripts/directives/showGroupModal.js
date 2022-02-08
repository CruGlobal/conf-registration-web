import template from 'views/components/showGroupModal.html';

angular.module('confRegistrationWebApp').component('showGroupModal', {
  templateUrl: template,
  bindings: {
    resolve: '<',
    dismiss: '&',
  },
  controller: function () {
    this.$onInit = () => {
      this.groupName = this.resolve.groupName;
      this.registrationId = this.resolve.registrationId;
      this.conference = this.resolve.conference;
      this.getRegistration = this.resolve.getRegistration;
      this.getRegistrantType = this.resolve.getRegistrantType;
      this.editRegistrant = this.resolve.editRegistrant;
      this.deleteRegistrant = this.resolve.deleteRegistrant;
      this.registerUser = this.resolve.registerUser;

      this.visibleRegistrantTypes = angular.copy(
        this.conference.registrantTypes,
      );

      const registration = this.getRegistration(this.registrationId);

      _.remove(this.visibleRegistrantTypes, function (registrantType) {
        //remove if type is marked as hidden and a registrant with this type doesn't already exist in the registration
        return (
          registrantType.hidden &&
          !_.includes(
            _.map(registration.registrants, 'registrantTypeId'),
            registrantType.id,
          )
        );
      });
    };

    this.register = function (typeId) {
      this.registerUser(this.getRegistration(this.registrationId), typeId);
    };

    this.registrationTypeFull = function (type) {
      if (!type.useLimit) {
        return false;
      }
      if (!type.availableSlots) {
        return true;
      }

      const registration = this.getRegistration(this.registrationId);

      // returns true when this registration type is full
      return (
        type.availableSlots <=
        _.filter(registration.registrants, { registrantTypeId: type.id }).length
      );
    };
  },
});
