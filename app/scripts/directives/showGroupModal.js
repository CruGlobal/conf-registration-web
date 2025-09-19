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

      // Group parent/primary
      const primaryRegistrant = _.find(registration.groupRegistrants, {
        id: registration.primaryRegistrantId,
      });

      // Get primary registrant type
      const primaryRegistrantType = this.getRegistrantType(
        primaryRegistrant ? primaryRegistrant.registrantTypeId : null,
      );

      // Get dependent registrant types
      const primaryRegistrantTypeSet =
        primaryRegistrantType && primaryRegistrantType.allowedRegistrantTypeSet
          ? primaryRegistrantType.allowedRegistrantTypeSet
          : [];

      // Filter visibleRegistrantTypes to only include those
      // that are children of the primary registrant type
      const childIds = _.map(primaryRegistrantTypeSet, 'childRegistrantTypeId');
      this.visibleRegistrantTypes = _.filter(
        this.visibleRegistrantTypes,
        function (type) {
          return _.includes(childIds, type.id);
        },
      );
    };

    this.register = function (typeId) {
      this.registerUser(
        this.getRegistration(this.registrationId),
        typeId,
        true,
      );
    };

    /*
     * The old implementation of this function did not work correctly,
     * as useLimit and availableSlots are not managed correctly.
     * This implementation takes advantage of allowedRegistrantTypeSet's
     * numberOfChildRegistrants to determine the dependent limit to reach
     * the intended behavior.
     * */
    this.registrationTypeFull = function (type) {
      const registration = this.getRegistration(this.registrationId);
      if (!registration || !registration.groupRegistrants) {
        return false;
      }

      const primaryRegistrant = _.find(registration.groupRegistrants, {
        id: registration.primaryRegistrantId,
      });
      if (!primaryRegistrant) {
        return false;
      }

      const primaryRegistrantType = this.getRegistrantType(
        primaryRegistrant.registrantTypeId,
      );
      if (
        !primaryRegistrantType ||
        !primaryRegistrantType.allowedRegistrantTypeSet
      ) {
        return false;
      }

      const dependent = _.find(
        primaryRegistrantType.allowedRegistrantTypeSet,
        (set) => set.childRegistrantTypeId === type.id,
      );
      if (!dependent) {
        return false;
      }

      const maxAllowedDependents = dependent.numberOfChildRegistrants;
      // numberOfChildRegistrants === 0 means no limit
      if (!maxAllowedDependents) {
        return false;
      }

      // Count current dependents of this type in the group
      if (!registration.groupRegistrants) {
        return true;
      }
      const currentCount = _.filter(registration.groupRegistrants, {
        registrantTypeId: type.id,
      }).length;

      // Return true if the group has reached the allowed limit for this dependent type
      return currentCount >= maxAllowedDependents;
    };
  },
});
