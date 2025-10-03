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
});
