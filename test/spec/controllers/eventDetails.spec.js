import 'angular-mocks';

describe('Controller: eventDetails', function () {
  var scope;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var fakeModal = {
    result: {
      then: function (confirmCallback, cancelCallback) {
        this.confirmCallBack = confirmCallback;
        this.cancelCallback = cancelCallback;
      },
    },
    close: function (item) {
      this.result.confirmCallBack(item);
    },
    dismiss: function (type) {
      this.result.cancelCallback(type);
    },
  };

  beforeEach(inject(function ($uibModal) {
    spyOn($uibModal, 'open').and.returnValue(fakeModal);
  }));

  let testData;
  let $httpBackend;

  describe('Conference with type', () => {
    beforeEach(
      angular.mock.inject(function (
        $rootScope,
        $controller,
        _$uibModal_,
        _testData_,
        _$httpBackend_,
      ) {
        testData = _testData_;
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;

        $httpBackend.whenGET(/^ministries|types$/).respond(200, []);

        $controller('eventDetailsCtrl', {
          $scope: scope,
          conference: testData.conference,
          currencies: testData.currencies,
          $uibModal: _$uibModal_,
          permissions: {},
        });

        scope.ministries = testData.ministries;
        scope.ministryPurposes = testData.ministryPurposes;
      }),
    );

    it('changeTab() should change tab', function () {
      scope.changeTab('paymentOptions');

      expect(scope.activeTab).toBe('paymentOptions');
    });

    it('addRegType should add reg type', function () {
      var totalRegTypes = scope.conference.registrantTypes.length;

      var modal = scope.addRegType();
      modal.close({
        name: 'Additional Type',
        defaultTypeKey: '',
      });

      expect(scope.conference.registrantTypes.length).toBe(totalRegTypes + 1);
    });

    it('addRegType() should set reg type eform to value of conference eform', () => {
      const totalRegTypes = scope.conference.registrantTypes.length;
      scope.conference.eform = true;
      const modal = scope.addRegType();
      modal.close({
        name: 'Additional Type',
        defaultTypeKey: '',
      });

      expect(scope.conference.registrantTypes.length).toBe(totalRegTypes + 1);
      const addedType = scope.conference.registrantTypes.find(
        (type) => type.name === 'Additional Type',
      );

      expect(addedType.eform).toEqual(true);
    });

    it('deleteRegType should remove reg type', function () {
      var totalRegTypes = scope.conference.registrantTypes.length;

      scope.deleteRegType(scope.conference.registrantTypes[0].id);

      expect(scope.conference.registrantTypes.length).toBe(totalRegTypes - 1);
    });

    it('anyPaymentMethodAccepted should be true', function () {
      expect(
        scope.anyPaymentMethodAccepted(scope.conference.registrantTypes[0]),
      ).toBe(true);
    });

    it("getPaymentGatewayType should return the conference's paymentGatewayType", function () {
      expect(scope.getPaymentGatewayType()).toBe(
        testData.conference.paymentGatewayType,
      );
    });

    it('setPristine() should pristine the form', () => {
      scope.eventDetails = {
        $setPristine() {},
      };

      const setPristine = spyOn(scope.eventDetails, '$setPristine');

      scope.setPristine();

      expect(setPristine).toHaveBeenCalledWith();
    });

    it('resetImage should set image and includeImageToAllPages to the value taken from the conference', () => {
      scope.image.includeImageToAllPages = false;
      scope.image.imageSrc = 'new-image';
      scope.resetImage();

      expect(scope.image.includeImageToAllPages).toEqual(
        scope.conference.image.includeImageToAllPages,
      );

      expect(scope.image.image).toEqual(scope.conference.image.image);
    });

    it('saveImage should save image and includeImageToAllPages', () => {
      scope.image.includeImageToAllPages = false;
      scope.image.image = 'new-image';
      $httpBackend
        .expectPUT(/^conferences\/[-a-zA-Z0-9]+\/image\.*/)
        .respond((verb, url, data) => {
          return [200, data, {}];
        });
      scope.saveImage();

      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

      expect(scope.image.includeImageToAllPages).toEqual(
        scope.conference.image.includeImageToAllPages,
      );

      expect(scope.image.image).toEqual(scope.conference.image.image);
    });

    it('deleteImage should delete image and set includeImageToAllPages to false', () => {
      $httpBackend
        .expectPUT(/^conferences\/[-a-zA-Z0-9]+\/image$/)
        .respond((verb, url, data) => {
          return [200, data, {}];
        });
      scope.deleteImage();

      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

      expect(scope.conference.image.includeImageToAllPages).toEqual(false);

      expect(scope.conference.image.image).toEqual('');
    });

    it('createLiabilityQuestions() should create liability related questions on first page', () => {
      scope.createLiabilityQuestions();

      expect(
        scope.conference.registrationPages[0].blocks[
          scope.conference.registrationPages[0].blocks.length - 1
        ].title,
      ).toEqual('Guardian Email');

      expect(
        scope.conference.registrationPages[0].blocks[
          scope.conference.registrationPages[0].blocks.length - 2
        ].title,
      ).toEqual('Guardian Name');

      expect(
        scope.conference.registrationPages[0].blocks[
          scope.conference.registrationPages[0].blocks.length - 3
        ].title,
      ).toEqual('Are you (the participant) under 18 years old?');
    });

    it('updateLiabilityQuestions() should delete liability related questions', () => {
      scope.createLiabilityQuestions();

      expect(scope.conference.registrationPages[0].blocks[3].title).toEqual(
        'Guardian Email',
      );

      expect(scope.conference.registrationPages[0].blocks[3].tag).toEqual(
        'EFORM',
      );

      expect(scope.conference.registrationPages[0].blocks[2].title).toEqual(
        'Guardian Name',
      );

      expect(scope.conference.registrationPages[0].blocks[2].tag).toEqual(
        'EFORM',
      );

      expect(scope.conference.registrationPages[0].blocks[1].title).toEqual(
        'Are you (the participant) under 18 years old?',
      );

      expect(scope.conference.registrationPages[0].blocks[1].tag).toEqual(
        'EFORM',
      );

      expect(scope.conference.registrationPages[0].blocks.length).toBe(4);

      scope.updateLiabilityQuestions();
      $httpBackend.flush();

      expect(scope.conference.registrationPages[0].blocks[3].tag).toEqual(null);

      expect(scope.conference.registrationPages[0].blocks[2].tag).toEqual(null);

      expect(scope.conference.registrationPages[0].blocks[2].tag).toEqual(null);
    });

    it('saveEvent() should validate the conference', () => {
      scope.saveEvent();
      //Expect that there will be event types given
      expect(scope.getEventTypes().length).toBeGreaterThan(0);
      expect(scope.notify.message.toString()).toContain(
        'Please enter which Event Type',
      );
    });
  });

  describe('Conference (Cru event) without type', function () {
    beforeEach(
      angular.mock.inject(function (
        $rootScope,
        $controller,
        _$uibModal_,
        _testData_,
        _$httpBackend_,
      ) {
        testData = _testData_;
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;

        testData.conference.type = null;
        testData.conference.eventType = null;

        $controller('eventDetailsCtrl', {
          $scope: scope,
          conference: testData.conference,
          currencies: testData.currencies,
          $uibModal: _$uibModal_,
          permissions: {},
        });
        scope.ministries = testData.ministries;
      }),
    );

    describe('saveEvent', () => {
      it('should validate the Ministry Purpose', () => {
        scope.saveEvent();

        expect(scope.notify.message.toString()).toContain(
          'Please enter Ministry Purpose.',
        );

        expect(scope.notify.message.toString()).not.toContain(
          'Please enter which Event Type',
        );
      });

      it('should validate the Event Name', () => {
        const errorMessage =
          'Please remove double quotes (") and ampersands (&) from the event name.';

        scope.saveEvent();

        expect(scope.notify.message.toString()).not.toContain(errorMessage);

        scope.conference.name = 'Men & Women Conference';
        scope.saveEvent();

        expect(scope.notify.message.toString()).toContain(errorMessage);

        scope.conference.name = '"Cru" Conference';
        scope.saveEvent();

        expect(scope.notify.message.toString()).toContain(errorMessage);
      });

      it('should validate the Event Abbreviation', () => {
        const errorMessage =
          'Please remove double quotes (") and ampersands (&) from the event abbreviation.';
        scope.saveEvent();

        expect(scope.notify.message.toString()).not.toContain(errorMessage);

        scope.conference.abbreviation = 'men&women';
        scope.saveEvent();

        expect(scope.notify.message.toString()).toContain(errorMessage);

        scope.conference.abbreviation = '"cru"conf';
        scope.saveEvent();

        expect(scope.notify.message.toString()).toContain(errorMessage);
      });
    });
  });

  describe('Conference (Cru event) without ministry hosting', function () {
    beforeEach(
      angular.mock.inject(function (
        $rootScope,
        $controller,
        _$uibModal_,
        _testData_,
        _$httpBackend_,
      ) {
        testData = _testData_;
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;

        testData.conference.ministry = null;
        testData.conference.eventType = null;

        $controller('eventDetailsCtrl', {
          $scope: scope,
          conference: testData.conference,
          currencies: testData.currencies,
          $uibModal: _$uibModal_,
          permissions: {},
        });
        scope.ministries = testData.ministries;
      }),
    );

    it('saveEvent() should validate the Ministry Hosting', () => {
      scope.saveEvent();

      expect(scope.notify.message.toString()).toContain(
        'Please enter Ministry Hosting Event.',
      );

      expect(scope.notify.message.toString()).not.toContain(
        'Please enter which Event Type',
      );
    });
  });

  describe('Conference that is not a Cru event', function () {
    beforeEach(
      angular.mock.inject(function (
        $rootScope,
        $controller,
        _$uibModal_,
        _testData_,
        _$httpBackend_,
      ) {
        testData = _testData_;
        scope = $rootScope.$new();
        $httpBackend = _$httpBackend_;

        testData.conference.cruEvent = null;
        testData.conference.type = null;
        testData.conference.ministry = null;
        testData.conference.eventType = null;

        $controller('eventDetailsCtrl', {
          $scope: scope,
          conference: testData.conference,
          currencies: testData.currencies,
          $uibModal: _$uibModal_,
          permissions: {},
        });
        scope.ministries = testData.ministries;
      }),
    );

    it('saveEvent() should not show errors of missing fields', () => {
      scope.saveEvent();

      expect(scope.notify.message.toString()).not.toContain(
        'Please enter Ministry Purpose.',
      );

      expect(scope.notify.message.toString()).not.toContain(
        'Please enter Ministry Hosting Event.',
      );

      expect(scope.notify.message.toString()).not.toContain(
        'Please enter which Event Type',
      );
    });

    describe('couple/spouse deletion cascading', function () {
      it('should delete spouse type when couple type is deleted', function () {
        const coupleType = _.find(
          testData.conference.registrantTypes,
          (type) => type.defaultTypeKey === 'COUPLE',
        );
        const spouseType = _.find(
          testData.conference.registrantTypes,
          (type) => type.defaultTypeKey === 'SPOUSE',
        );

        const initialLength = scope.conference.registrantTypes.length;

        expect(coupleType).toBeDefined();
        expect(spouseType).toBeDefined();

        scope.deleteRegType(coupleType.id);

        const remainingTypes = scope.conference.registrantTypes;

        expect(remainingTypes.length).toBe(initialLength - 2);
        expect(_.find(remainingTypes, { id: coupleType.id })).toBeUndefined();
        expect(_.find(remainingTypes, { id: spouseType.id })).toBeUndefined();
      });

      it('should remove deleted couple type from all allowedRegistrantTypeSet arrays', function () {
        const coupleType = _.find(
          scope.conference.registrantTypes,
          (type) => type.defaultTypeKey === 'COUPLE',
        );

        // Add couple type to another registrant type's allowedRegistrantTypeSet
        const otherType = scope.conference.registrantTypes[0];
        otherType.allowedRegistrantTypeSet = [
          {
            id: 'test-id',
            childRegistrantTypeId: coupleType.id,
            numberOfChildRegistrants: 2,
            selected: true,
          },
        ];

        expect(otherType.allowedRegistrantTypeSet.length).toBe(1);

        scope.deleteRegType(coupleType.id);

        expect(otherType.allowedRegistrantTypeSet.length).toBe(0);
      });

      it('should remove deleted spouse type from all allowedRegistrantTypeSet arrays when couple is deleted', function () {
        const coupleType = _.find(
          scope.conference.registrantTypes,
          (type) => type.defaultTypeKey === 'COUPLE',
        );
        const spouseType = _.find(
          scope.conference.registrantTypes,
          (type) => type.defaultTypeKey === 'SPOUSE',
        );

        // Add spouse type to another registrant type's allowedRegistrantTypeSet
        const otherType = scope.conference.registrantTypes[0];
        otherType.allowedRegistrantTypeSet = [
          {
            id: 'test-id-spouse',
            childRegistrantTypeId: spouseType.id,
            numberOfChildRegistrants: 1,
            selected: true,
          },
        ];

        expect(otherType.allowedRegistrantTypeSet.length).toBe(1);

        scope.deleteRegType(coupleType.id);

        // Both couple and spouse should be removed from allowedRegistrantTypeSet
        expect(otherType.allowedRegistrantTypeSet.length).toBe(0);
      });

      it('should not delete spouse type when regular registrant type is deleted', function () {
        const regularType = _.find(
          scope.conference.registrantTypes,
          (type) =>
            type.defaultTypeKey !== 'COUPLE' &&
            type.defaultTypeKey !== 'SPOUSE',
        );
        const spouseType = _.find(
          scope.conference.registrantTypes,
          (type) => type.defaultTypeKey === 'SPOUSE',
        );

        const initialLength = scope.conference.registrantTypes.length;

        expect(regularType).toBeDefined();
        expect(spouseType).toBeDefined();

        scope.deleteRegType(regularType.id);

        const remainingTypes = scope.conference.registrantTypes;

        expect(remainingTypes.length).toBe(initialLength - 1);
        expect(_.find(remainingTypes, { id: regularType.id })).toBeUndefined();
        expect(_.find(remainingTypes, { id: spouseType.id })).toBeDefined();
      });

      it('should handle deletion when spouse type is not found for couple', function () {
        // Create a couple type without an associated spouse
        scope.conference.registrantTypes.push({
          id: 'lone-couple-id',
          name: 'Lone Couple',
          defaultTypeKey: 'COUPLE',
          allowedRegistrantTypeSet: [],
        });

        const initialLength = scope.conference.registrantTypes.length;

        // Should not throw error when no spouse is found
        expect(() => {
          scope.deleteRegType('lone-couple-id');
        }).not.toThrow();

        expect(scope.conference.registrantTypes.length).toBe(initialLength - 1);
      });

      it('should handle multiple allowedRegistrantTypeSet entries correctly during deletion', function () {
        const coupleType = _.find(
          scope.conference.registrantTypes,
          (type) => type.defaultTypeKey === 'COUPLE',
        );
        const spouseType = _.find(
          scope.conference.registrantTypes,
          (type) => type.defaultTypeKey === 'SPOUSE',
        );
        const regularType = scope.conference.registrantTypes[0];

        // Add multiple entries to allowedRegistrantTypeSet
        regularType.allowedRegistrantTypeSet = [
          {
            id: 'entry-1',
            childRegistrantTypeId: coupleType.id,
            numberOfChildRegistrants: 2,
            selected: true,
          },
          {
            id: 'entry-2',
            childRegistrantTypeId: spouseType.id,
            numberOfChildRegistrants: 1,
            selected: true,
          },
          {
            id: 'entry-3',
            childRegistrantTypeId: 'some-other-id',
            numberOfChildRegistrants: 3,
            selected: true,
          },
        ];

        expect(regularType.allowedRegistrantTypeSet.length).toBe(3);

        scope.deleteRegType(coupleType.id);

        // Should remove both couple and spouse entries, keeping only the other entry
        expect(regularType.allowedRegistrantTypeSet.length).toBe(1);
        expect(
          regularType.allowedRegistrantTypeSet[0].childRegistrantTypeId,
        ).toBe('some-other-id');
      });

      it('should prevent deletion when only one registrant type remains', function () {
        // Remove all but one registrant type
        scope.conference.registrantTypes = [
          scope.conference.registrantTypes[0],
        ];

        const singleType = scope.conference.registrantTypes[0];

        scope.deleteRegType(singleType.id);

        // Should not delete the type and should show error notification
        expect(scope.conference.registrantTypes.length).toBe(1);
        expect(scope.notify.class).toBe('alert-danger');
        expect(scope.notify.message.toString()).toContain(
          'You must have at least one registrant type per event',
        );
      });
    });
  });

  describe('couple/spouse data syncing', function () {
    it('should give spouse type a description when couple type description is changed', inject(function (
      $controller,
      $rootScope,
    ) {
      $rootScope.$new();

      $controller('eventDetailsCtrl', {
        $scope: scope,
        conference: testData.conference,
        currencies: testData.currencies,
        permissions: {},
      });

      const conference = scope.conference;
      const coupleType = _.find(
        conference.registrantTypes,
        (t) => t.defaultTypeKey === 'COUPLE',
      );
      const spouseType = _.find(
        conference.registrantTypes,
        (t) => t.defaultTypeKey === 'SPOUSE',
      );

      coupleType.description = 'Old Description';
      spouseType.description = 'Old Description';

      const newDescription = 'New Couple Description';
      coupleType.description = newDescription;

      const oldRegistrantTypes = angular.copy(conference.registrantTypes);
      _.find(
        oldRegistrantTypes,
        (t) => t.defaultTypeKey === 'COUPLE',
      ).description = 'Old Description';
      _.find(
        oldRegistrantTypes,
        (t) => t.defaultTypeKey === 'SPOUSE',
      ).description = 'Old Description';

      scope.syncCoupleDescriptions(
        conference.registrantTypes,
        oldRegistrantTypes,
      );

      expect(coupleType.description).toBe(newDescription);
      expect(spouseType.description).toBe(newDescription);
    }));
  });
});
