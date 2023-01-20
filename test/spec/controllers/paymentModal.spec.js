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
        conference: {},
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
});
