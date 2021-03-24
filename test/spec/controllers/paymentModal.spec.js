import 'angular-mocks';

describe('Controller: paymentModal', function() {
  var scope, modalInstance;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(function($rootScope, $controller, testData) {
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
  beforeEach(inject(_modalMessage_ => {
    errorModal = spyOn(_modalMessage_, 'error');
  }));

  it('canBeRefunded should return true', function() {
    expect(scope.canBeRefunded(scope.registration.pastPayments[0])).toBe(true);
  });

  it('savePaymentEdits should validate chect number', () => {
    let payment = { paymentType: 'CHECK', status: 'RECEIVED', check: {} };

    scope.savePaymentEdits(payment);

    expect(errorModal).toHaveBeenCalledWith('Please enter a check number.');
  });

  describe('disableEditingPaymentAmount', () => {
    it('returns true and disables editing if paymentType is TRANSFER and a past account transfer payment has been reported', () => {
      let payment = { paymentType: 'TRANSFER', reported: false };

      let pastPayments = [payment, { paymentType: 'TRANSFER', reported: true }];

      const result = scope.disableEditingPaymentAmount(payment, pastPayments);

      expect(result).toBe(true);
    });

    it('returns true and disables editing if paymentType is TRANSFER and a past scholarship payment has been reported', () => {
      let payment = { paymentType: 'TRANSFER', reported: false };

      let pastPayments = [
        payment,
        { paymentType: 'SCHOLARSHIP', reported: true },
      ];

      const result = scope.disableEditingPaymentAmount(payment, pastPayments);

      expect(result).toBe(true);
    });

    it('returns true and disables editing if paymentType is SCHOLARSHIP and a past scholarship payment has been reported', () => {
      let payment = { paymentType: 'SCHOLARSHIP', reported: false };

      let pastPayments = [
        payment,
        { paymentType: 'SCHOLARSHIP', reported: true },
      ];

      const result = scope.disableEditingPaymentAmount(payment, pastPayments);

      expect(result).toBe(true);
    });

    it('returns true and disables editing if paymentType is SCHOLARSHIP and a past account transfer payment has been reported', () => {
      let payment = { paymentType: 'SCHOLARSHIP', reported: false };

      let pastPayments = [payment, { paymentType: 'TRANSFER', reported: true }];

      const result = scope.disableEditingPaymentAmount(payment, pastPayments);

      expect(result).toBe(true);
    });

    it('returns false and does not disable editing if paymentType is SCHOLARSHIP and no other past account transfer or scholarship payments have been reported', () => {
      let payment = { paymentType: 'SCHOLARSHIP', reported: false };

      let pastPayments = [
        payment,
        { paymentType: 'TRANSFER', reported: false },
        { paymentType: 'SCHOLARSHIP', reported: false },
      ];

      const result = scope.disableEditingPaymentAmount(payment, pastPayments);

      expect(result).toBe(false);
    });

    it('returns false and does not disable editing if paymentType is TRANSFER and no other past account transfer or scholarship payments have been reported', () => {
      let payment = { paymentType: 'TRANSFER', reported: false };

      let pastPayments = [
        payment,
        { paymentType: 'TRANSFER', reported: false },
        { paymentType: 'SCHOLARSHIP', reported: false },
      ];

      const result = scope.disableEditingPaymentAmount(payment, pastPayments);

      expect(result).toBe(false);
    });

    it('does not disable editing if other past reported payments do not have a paymentType of SCHOLARSHIP or TRANSFER', () => {
      let payment = { paymentType: 'TRANSFER', reported: false };

      let pastPayments = [
        payment,
        { paymentType: 'CASH', reported: true },
        { paymentType: 'CREDIT_CARD', reported: true },
        { paymentType: 'CHECK', reported: true },
        { paymentType: 'OFFLINE_CREDIT_CARD', reported: true },
      ];

      const result = scope.disableEditingPaymentAmount(payment, pastPayments);

      expect(result).toBe(false);
    });
  });
});
