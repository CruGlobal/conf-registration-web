import 'angular-mocks';

describe('Directive: ertPayment', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var scope, $rootScope, element, $compile;
  beforeEach(inject((_$rootScope_, $templateCache, _$compile_, testData) => {
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    scope = $rootScope.$new();
    scope.conference = testData.conference;
    scope.registration = testData.registration;
    $templateCache.put('views/components/payment.html', '');

    element = $compile('<div ert-payment registration="registration"></div>')(
      scope,
    );
    scope.$digest();
    scope = element.isolateScope() || element.scope();
  }));

  beforeEach(inject(($rootScope) => {
    spyOn($rootScope, 'globalUser').and.returnValue({
      employeeId: '9870123457S',
    });
  }));

  it('accountTypeChanged to STAFF should prefill accountNumber', () => {
    scope.currentPayment = {
      transfer: { accountType: 'STAFF', accountNumber: '123' },
    };
    scope.accountTypeChanged();

    expect(scope.currentPayment.transfer.accountNumber).toBe('0123457');
  });

  it('accountTypeChanged to something not equal to STAFF should not prefill accountNumber', () => {
    scope.currentPayment = {
      transfer: { accountType: 'not-staff', accountNumber: '123' },
    };
    scope.accountTypeChanged();

    expect(scope.currentPayment.transfer.accountNumber).toBe('');
  });

  it('accountTypeChanged to NON_US_STAFF should pre-fill businessUnit and department', () => {
    scope.currentPayment = {
      transfer: {
        accountType: 'NON_US_STAFF',
        department: 'department',
        businessUnit: 'businessUnit',
      },
    };
    scope.accountTypeChanged();

    expect(scope.currentPayment.transfer.businessUnit).toBe('INTLM');
    expect(scope.currentPayment.transfer.department).toBe('GENL');
  });

  it('accountTypeChanged to something not equal to NON_US_STAFF should not pre-fill businessUnit and department', () => {
    scope.currentPayment = {
      transfer: {
        accountType: 'not-NON_US_STAFF',
        department: 'department',
        businessUnit: 'businessUnit',
      },
    };
    scope.accountTypeChanged();

    expect(scope.currentPayment.transfer.businessUnit).toBe('');
    expect(scope.currentPayment.transfer.department).toBe('');
  });

  it('validatePayment should validate required TRANSFER NON_US_STAFF operatingUnit field', () => {
    scope.currentPayment = {
      paymentType: 'TRANSFER',
      transfer: {
        accountType: 'NON_US_STAFF',
        department: 'GENL',
        businessUnit: 'INTLM',
        operatingUnit: '',
        accountNumber: 'accountNumber',
      },
    };
    scope.validatePayment(scope.currentPayment);

    expect(scope.currentPayment.errors).toContain(
      'Please fill in Operating Unit and Account Number fields.',
    );
  });

  it('validatePayment should validate required TRANSFER NON_US_STAFF accountNumber field', () => {
    scope.currentPayment = {
      paymentType: 'TRANSFER',
      transfer: {
        accountType: 'NON_US_STAFF',
        department: 'GENL',
        businessUnit: 'INTLM',
        operatingUnit: 'operatingUnit',
        accountNumber: '',
      },
    };
    scope.validatePayment(scope.currentPayment);

    expect(scope.currentPayment.errors).toContain(
      'Please fill in Operating Unit and Account Number fields.',
    );
  });

  describe('FL_GIFT_CARD payment validation', () => {
    it('should pass validation with card code of 10 characters', () => {
      scope.currentPayment = {
        paymentType: 'FL_GIFT_CARD',
        giftCard: {
          giftCardId: '1234567890',
        },
      };
      scope.validatePayment(scope.currentPayment);

      expect(scope.currentPayment.errors).toEqual([]);
    });

    it('should pass validation with card code of 12 characters', () => {
      scope.currentPayment = {
        paymentType: 'FL_GIFT_CARD',
        giftCard: {
          giftCardId: '1234567890Ab',
        },
      };
      scope.validatePayment(scope.currentPayment);

      expect(scope.currentPayment.errors).toEqual([]);
    });

    it('should require card code when empty', () => {
      scope.currentPayment = {
        paymentType: 'FL_GIFT_CARD',
        giftCard: {
          giftCardId: '',
        },
      };
      scope.validatePayment(scope.currentPayment);

      expect(scope.currentPayment.errors).toContain(
        'Please enter a gift card code.',
      );
    });

    it('should reject card code with less than 10 characters', () => {
      scope.currentPayment = {
        paymentType: 'FL_GIFT_CARD',
        giftCard: {
          giftCardId: '123456789',
        },
      };
      scope.validatePayment(scope.currentPayment);

      expect(scope.currentPayment.errors).toContain(
        'Gift card code must be at least 10 characters.',
      );
    });

    it('should reject card code with more than 12 characters', () => {
      scope.currentPayment = {
        paymentType: 'FL_GIFT_CARD',
        giftCard: {
          giftCardId: '1234567890123',
        },
      };
      scope.validatePayment(scope.currentPayment);

      expect(scope.currentPayment.errors).toContain(
        'Gift card code must be no more than 12 characters.',
      );
    });

    it('should reject card code with non-alphanumeric characters', () => {
      scope.currentPayment = {
        paymentType: 'FL_GIFT_CARD',
        giftCard: {
          giftCardId: '1234567890#*',
        },
      };
      scope.validatePayment(scope.currentPayment);

      expect(scope.currentPayment.errors).toContain(
        'Gift card code must contain only letters and numbers.',
      );
    });
  });
});
