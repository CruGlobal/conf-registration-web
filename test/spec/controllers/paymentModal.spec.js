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
