import 'angular-mocks';

describe('Directive: ertPayment', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var scope, $rootScope, element, $compile;
  beforeEach(inject((_$rootScope_, $templateCache, _$compile_, testData) => {
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    scope = $rootScope.$new();
    scope.registration = testData.registration;
    $templateCache.put('views/components/payment.html', '');

    element = $compile(
      `<div ert-payment currency="'USD'" registration="registration"></div>`,
    )(scope);
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

  describe('initializePaymentType', () => {
    it('should initialize payment type to CREDIT_CARD when accepted', () => {
      scope.currentPayment = {};
      scope.paymentMethods = () => ({ acceptCreditCards: true });

      scope.initializePaymentType();

      expect(scope.currentPayment.paymentType).toBe('CREDIT_CARD');
    });

    it('should initialize payment type to CHECK when credit cards not accepted', () => {
      scope.currentPayment = {};
      scope.paymentMethods = () => ({
        acceptCreditCards: false,
        acceptChecks: true,
      });

      scope.initializePaymentType();

      expect(scope.currentPayment.paymentType).toBe('CHECK');
    });

    it('should not override existing payment type', () => {
      scope.currentPayment = { paymentType: 'CHECK' };
      scope.paymentMethods = () => ({ acceptCreditCards: true });

      scope.initializePaymentType();

      expect(scope.currentPayment.paymentType).toBe('CHECK');
    });
  });
});
