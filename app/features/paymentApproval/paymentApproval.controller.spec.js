import 'angular-mocks';

describe('Controller: paymentApproval', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let scope;
  let rootScope;
  let $httpBackend;
  let $q;
  let staffAccountService;
  let accountNumberPromise;
  let lookupCalls;
  const paymentHash = 'test-hash';

  function initController(payment, conference) {
    angular.mock.inject(function (
      $rootScope,
      $controller,
      _$httpBackend_,
      _$q_,
    ) {
      rootScope = $rootScope;
      scope = $rootScope.$new();
      $httpBackend = _$httpBackend_;
      $q = _$q_;

      accountNumberPromise = $q.resolve('');
      lookupCalls = 0;
      staffAccountService = {
        getProfileStaffAccountNumber: function () {
          lookupCalls++;
          return accountNumberPromise;
        },
      };

      $httpBackend
        .whenGET('payments/scholarship/' + paymentHash)
        .respond({ payment: payment, conference: conference });
      $controller('PaymentApprovalCtrl', {
        $scope: scope,
        $routeParams: { paymentHash: paymentHash },
        staffAccountService: staffAccountService,
      });
    });
  }

  afterEach(function () {
    if ($httpBackend) {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    }
  });

  it('sets payment', () => {
    initController({ scholarship: {} }, { id: 'c1' });
    $httpBackend.flush();

    expect(scope.payment).toBeDefined();
    expect(scope.payment.scholarship).toBeDefined();
  });

  it('auto-populates and locks the account number for STAFF scholarships', () => {
    initController({ scholarship: { accountType: 'STAFF' } }, { id: 'c1' });
    accountNumberPromise = $q.resolve('0123456');
    $httpBackend.flush();

    expect(lookupCalls).toBe(1);
    expect(scope.payment.scholarship.accountNumber).toBe('0123456');
    expect(scope.accountNumberDisabled).toBe(true);
    expect(scope.staffAccountNumberError).toBe(false);
  });

  it('shows an error when there is no staff account number', () => {
    initController({ scholarship: { accountType: 'STAFF' } }, { id: 'c1' });
    accountNumberPromise = $q.resolve('');
    $httpBackend.flush();

    expect(scope.payment.scholarship.accountNumber).toBe('');
    expect(scope.accountNumberDisabled).toBe(false);
    expect(scope.staffAccountNumberError).toBe(true);
  });

  it('does not look up an account number for MINISTRY scholarships', () => {
    initController({ scholarship: { accountType: 'MINISTRY' } }, { id: 'c1' });
    $httpBackend.flush();

    expect(lookupCalls).toBe(0);
    expect(scope.accountNumberDisabled).toBe(false);
  });

  it('re-fetches or clears when the account type changes', () => {
    initController({ scholarship: { accountType: 'MINISTRY' } }, { id: 'c1' });
    $httpBackend.flush();

    scope.payment.scholarship.accountType = 'STAFF';
    accountNumberPromise = $q.resolve('999');
    scope.accountTypeChanged();
    rootScope.$digest();

    expect(scope.payment.scholarship.accountNumber).toBe('999');
    expect(scope.accountNumberDisabled).toBe(true);

    scope.payment.scholarship.accountType = 'MINISTRY';
    scope.accountTypeChanged();

    expect(scope.payment.scholarship.accountNumber).toBe('');
    expect(scope.accountNumberDisabled).toBe(false);
    expect(scope.staffAccountNumberError).toBe(false);
  });
});
