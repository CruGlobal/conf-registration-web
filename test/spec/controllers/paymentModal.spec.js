import 'angular-mocks';

describe('Controller: paymentModal', function () {
  var scope, modalInstance;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(function ($rootScope, $controller, testData) {
      scope = $rootScope.$new();
      modalInstance = {
        close: jasmine.createSpy('modalInstance.close'),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then'),
        },
      };

      $controller('paymentModal', {
        $scope: scope,
        $uibModalInstance: modalInstance,
        registration: testData.registration,
        promotionRegistrationInfoList: [
          {
            registrationId: testData.registration.id,
            promotionId: 'promotion-1',
            error: '',
          },
          {
            registrationId: 'other-registration-id',
            promotionId: 'promotion-2',
          },
          {
            registrationId: testData.registration.id,
            promotionId: 'promotion-3',
            error: 'Error',
          },
        ],
        conference: testData.conference,
        permissions: {},
      });
    }),
  );

  let errorModal;
  beforeEach(inject((_modalMessage_) => {
    errorModal = spyOn(_modalMessage_, 'error');
  }));

  it('canBeRefunded should return true', function () {
    expect(scope.canBeRefunded(scope.registration.pastPayments[0])).toBe(true);
  });

  it('savePaymentEdits should validate chect number', () => {
    let payment = { paymentType: 'CHECK', status: 'RECEIVED', check: {} };

    scope.savePaymentEdits(payment);

    expect(errorModal).toHaveBeenCalledWith('Please enter a check number.');
  });

  describe('isPromoPosted', () => {
    it('returns true for posted promos', () => {
      expect(scope.isPromoPosted('promotion-1')).toBe(true);
    });

    it('returns false for unposted promos', () => {
      expect(scope.isPromoPosted('promotion-2')).toBe(false);
    });

    it('returns false for promos with an error during post', () => {
      expect(scope.isPromoPosted('promotion-3')).toBe(false);
    });
  });

  describe('canEditPayment', () => {
    it('returns true if paymentType is TRANSFER and payment has not been reported', () => {
      let payment = { paymentType: 'TRANSFER', reported: false };

      const result = scope.canEditPayment(payment);

      expect(result).toBe(true);
    });

    it('returns true if paymentType is SCHOLARSHIP and payment has not been reported', () => {
      let payment = { paymentType: 'SCHOLARSHIP', reported: false };

      const result = scope.canEditPayment(payment);

      expect(result).toBe(true);
    });

    it('returns false if paymentType is not a TRANSFER or SCHOLARSHIP but has been reported', () => {
      let payment = { paymentType: 'CHECK', reported: true };

      const result = scope.canEditPayment(payment);

      expect(result).toBe(false);
    });

    it('returns true if paymentType is TRANSFER and payment has been reported', () => {
      let payment = { paymentType: 'TRANSFER', reported: true };

      const result = scope.canEditPayment(payment);

      expect(result).toBe(true);
    });

    it('returns true if paymentType is SCHOLARSHIP and payment has been reported', () => {
      let payment = { paymentType: 'SCHOLARSHIP', reported: true };

      const result = scope.canEditPayment(payment);

      expect(result).toBe(true);
    });
  });

  describe('isSpouse', () => {
    let registrant;

    beforeEach(() => {
      registrant = {
        registrantTypeId: null,
      };
    });

    it('returns true when registrant type is associated with a Couple type', () => {
      registrant.registrantTypeId = 'a1b2c3d4-e5f6-7890-abcd-1234567890ef';

      expect(scope.isSpouse(registrant)).toBe(true);
    });

    it('returns false when registrant type is a Spouse but not associated with a Couple type', () => {
      registrant.registrantTypeId = 'f3c2e1d4-7b8a-4c6f-9e2b-9876543210fe';

      expect(scope.isSpouse(registrant)).toBe(false);
    });

    it('returns false when registrant type is a Couple type', () => {
      registrant.registrantTypeId = 'b2c3d4e5-f6a7-8901-bcde-234567890abc';

      expect(scope.isSpouse(registrant)).toBe(false);
    });

    it('returns false for unrelated registrant type', () => {
      registrant.registrantTypeId = '47de2c40-19dc-45b3-9663-5c005bd6464b';

      expect(scope.isSpouse(registrant)).toBe(false);
    });
  });

  describe('showAvailablePromotions', () => {
    let globalPromotionService, initController, testData, $q, $rootScope;

    beforeEach(inject(function ($controller, _testData_, _$q_, _$rootScope_) {
      globalPromotionService = {
        loadPromotions: jasmine.createSpy('loadPromotions'),
      };
      testData = _testData_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      initController = (conference) => {
        $controller('paymentModal', {
          $scope: scope,
          $uibModalInstance: modalInstance,
          registration: testData.registration,
          promotionRegistrationInfoList: [],
          conference: conference,
          permissions: {},
          globalPromotionService: globalPromotionService,
        });
      };
    }));

    it('returns true and has only local promotions when conference has promotions but no ministry/ministryActivity', inject(function () {
      const conferenceWithLocalPromotions = {
        ...testData.conference,
        ministry: null,
        ministryActivity: null,
      };

      initController(conferenceWithLocalPromotions);

      expect(scope.availablePromotions).toEqual(testData.conference.promotions);

      expect(scope.showAvailablePromotions()).toBe(true);
    }));

    it('returns false and has empty availablePromotions when conference has no promotions and no ministry/ministryActivity', inject(function () {
      const conferenceWithoutPromotions = {
        ...testData.conference,
        promotions: [],
        ministry: null,
        ministryActivity: null,
      };

      initController(conferenceWithoutPromotions);

      expect(scope.availablePromotions).toEqual([]);

      expect(scope.showAvailablePromotions()).toBe(false);
    }));

    it('returns true and combines local and global promotions when conference has ministry/ministryActivity', function () {
      const conferenceWithMinistry = {
        ...testData.conference,
        ministry: testData.ministries[0],
        ministryActivity: testData.ministries[0].activities[0],
      };

      globalPromotionService.loadPromotions.and.returnValue(
        $q.resolve(testData.globalPromotions),
      );

      initController(conferenceWithMinistry);

      expect(scope.availablePromotions).toEqual(testData.conference.promotions);
      expect(scope.showAvailablePromotions()).toBe(true);

      $rootScope.$digest();

      expect(scope.availablePromotions).toEqual([
        ...testData.conference.promotions,
        ...testData.globalPromotions,
      ]);

      expect(scope.showAvailablePromotions()).toBe(true);
    });

    it('returns true and has only global promotions when conference has no local promotions but has ministry/ministryActivity', function () {
      const conferenceWithMinistryNoLocal = {
        ...testData.conference,
        promotions: [],
        ministry: 'test-ministry',
        ministryActivity: 'test-activity',
      };

      globalPromotionService.loadPromotions.and.returnValue(
        $q.resolve(testData.globalPromotions),
      );

      initController(conferenceWithMinistryNoLocal);

      expect(scope.availablePromotions).toEqual([]);
      expect(scope.showAvailablePromotions()).toBe(false);

      $rootScope.$digest();

      expect(scope.availablePromotions).toEqual(testData.globalPromotions);

      expect(scope.showAvailablePromotions()).toBe(true);
    });
  });

  describe('deletePromotion', () => {
    let $httpBackend;

    beforeEach(
      angular.mock.inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
      }),
    );

    afterEach(() => {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('removes local promotion successfully', inject(function (testData) {
      const promotionIdToDelete = testData.registration.promotions[0].id;

      expect(testData.registration.promotions.length).toBe(2);

      $httpBackend
        .expectPUT(
          'registrations/' + testData.registration.id,
          function (data) {
            const updatedRegistration = JSON.parse(data);

            expect(updatedRegistration.promotions.length).toBe(1);
            expect(
              updatedRegistration.promotions.some(
                (promotion) => promotion.id === promotionIdToDelete,
              ),
            ).toBe(false);
            return true;
          },
        )
        .respond(200);

      scope.deletePromotion(promotionIdToDelete);
      $httpBackend.flush();
    }));

    it('removes global promotion successfully', inject(function (testData) {
      const promotionIdToDelete = testData.registration.globalPromotions[0].id;

      expect(testData.registration.globalPromotions.length).toBe(3);

      $httpBackend
        .expectPUT(
          'registrations/' + testData.registration.id,
          function (data) {
            const updatedRegistration = JSON.parse(data);

            expect(updatedRegistration.globalPromotions.length).toBe(2);
            expect(
              updatedRegistration.globalPromotions.some(
                (promotion) => promotion.id === promotionIdToDelete,
              ),
            ).toBe(false);
            return true;
          },
        )
        .respond(200);

      scope.deletePromotion(promotionIdToDelete);
      $httpBackend.flush();
    }));

    it('shows error message when deletion fails', inject(function (testData) {
      $httpBackend
        .expectPUT('registrations/' + testData.registration.id)
        .respond(500, { error: { message: 'Server error' } });

      scope.deletePromotion(testData.registration.promotions[0].id);
      $httpBackend.flush();

      expect(errorModal).toHaveBeenCalledWith('Server error');
    }));
  });
});
