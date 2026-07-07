import 'angular-mocks';

describe('Directive: ertPayment', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var scope,
    $rootScope,
    element,
    $compile,
    ProfileCache,
    $q,
    staffAccountService;
  beforeEach(inject((
    _$rootScope_,
    $templateCache,
    _$compile_,
    _ProfileCache_,
    _$q_,
    _staffAccountService_,
    testData,
  ) => {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    ProfileCache = _ProfileCache_;
    $q = _$q_;
    staffAccountService = _staffAccountService_;

    spyOn($rootScope, 'globalUser').and.returnValue({
      staffAccountNumber: '9870123457',
    });
    spyOn(ProfileCache, 'clearCache');
    spyOn(ProfileCache, 'getCache').and.callFake(() =>
      $q.resolve({ staffAccountNumber: '9870123457' }),
    );

    scope = $rootScope.$new();
    scope.conference = testData.conference;
    scope.registration = testData.registration;
    scope.currentPayment = {};
    scope.isAdminPayment = false;
    $templateCache.put('scripts/directives/payment/payment.html', '');

    element = $compile(
      '<div ert-payment payment="currentPayment" admin-payment="isAdminPayment" registration="registration"></div>',
    )(scope);
    scope.$digest();
    scope = element.isolateScope() || element.scope();
  }));

  it('when ProfileCache.getCache fails, accountNumber should be set to empty string', () => {
    ProfileCache.getCache.and.returnValue($q.reject());
    scope.currentPayment = {
      transfer: { accountType: 'STAFF', accountNumber: '123' },
    };
    scope.accountTypeChanged();
    scope.$apply();

    expect(scope.currentPayment.transfer.accountNumber).toBe('');
    expect(scope.accountNumberDisabled).toBe(false);
  });

  it('accountTypeChanged to STAFF should prefill accountNumber when not an admin payment', () => {
    scope.currentPayment = {
      transfer: { accountType: 'STAFF', accountNumber: '123' },
    };
    scope.accountTypeChanged();
    scope.$apply();

    expect(scope.currentPayment.transfer.accountNumber).toBe('9870123457');
    expect(scope.accountNumberDisabled).toBe(true);
  });

  it('accountTypeChanged to STAFF should prefill employeeId when not an admin payment and staffAccountNumber is not available', () => {
    $rootScope.globalUser.and.returnValue({
      employeeId: '0001234567',
    });
    ProfileCache.getCache.and.returnValue(
      $q.resolve({ staffAccountNumber: '' }),
    );
    scope.currentPayment = {
      transfer: { accountType: 'STAFF', accountNumber: '123' },
    };
    scope.accountTypeChanged();
    scope.$apply();

    expect(scope.currentPayment.transfer.accountNumber).toBe('1234567');
    expect(scope.accountNumberDisabled).toBe(false);
  });

  it('accountTypeChanged to STAFF should not prefill accountNumber when an admin payment', () => {
    scope.isAdminPayment = true;
    scope.currentPayment = {
      transfer: { accountType: 'STAFF', accountNumber: '123' },
    };
    scope.accountTypeChanged();

    expect(scope.currentPayment.transfer.accountNumber).toBe('');
    expect(scope.accountNumberDisabled).toBe(false);
  });

  it('accountTypeChanged to something not equal to STAFF should not prefill accountNumber', () => {
    scope.currentPayment = {
      transfer: { accountType: 'not-staff', accountNumber: '123' },
    };
    scope.accountTypeChanged();

    expect(scope.currentPayment.transfer.accountNumber).toBe('');
    expect(scope.accountNumberDisabled).toBe(false);
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

  describe('selectStaffAccountNumber', () => {
    it('applies the looked up account number to the selected payment method', () => {
      spyOn(staffAccountService, 'staffAccountNumberLookup').and.returnValue(
        $q.resolve({ accountNumber: '9870123457', message: null }),
      );
      scope.currentPayment = { transfer: {} };

      scope.selectStaffAccountNumber({ email: 'staff@cru.org' }, 'transfer');
      scope.$apply();

      expect(staffAccountService.staffAccountNumberLookup).toHaveBeenCalledWith(
        'staff@cru.org',
        scope.conference.id,
      );

      expect(scope.currentPayment.transfer.accountNumber).toBe('9870123457');
    });

    it('displays the lookup message and leaves the account number empty', () => {
      spyOn(staffAccountService, 'staffAccountNumberLookup').and.returnValue(
        $q.resolve({
          accountNumber: '',
          message: 'No staff member was found with that email address.',
        }),
      );
      scope.currentPayment = { scholarship: {} };

      scope.selectStaffAccountNumber({ email: 'staff@cru.org' }, 'scholarship');
      scope.$apply();

      expect(scope.currentPayment.scholarship.accountNumber).toBe('');
      expect(scope.staffAccountLookupMessage).toBe(
        'No staff member was found with that email address.',
      );
    });

    it('clears any prior lookup message before the new lookup resolves', () => {
      spyOn(staffAccountService, 'staffAccountNumberLookup').and.returnValue(
        $q.resolve({ accountNumber: '9870123457', message: null }),
      );
      scope.currentPayment = { transfer: { accountNumber: 'OLD' } };
      scope.staffAccountLookupMessage = 'stale error from a previous lookup';

      scope.selectStaffAccountNumber({ email: 'staff@cru.org' }, 'transfer');

      expect(scope.staffAccountLookupMessage).toBeNull();
      expect(scope.currentPayment.transfer.accountNumber).toBe('');

      scope.$apply();

      expect(scope.currentPayment.transfer.accountNumber).toBe('9870123457');
    });
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
