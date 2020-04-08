import 'angular-mocks';

describe('Directive: ertPayment', function() {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var scope, $rootScope, element, $compile;
  beforeEach(inject((_$rootScope_, $templateCache, _$compile_) => {
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    scope = $rootScope.$new();
    $templateCache.put('views/components/payment.html', '');

    element = $compile('<div ert-payment></div>')(scope);
    scope.$digest();
    scope = element.isolateScope() || element.scope();
  }));

  beforeEach(inject($rootScope => {
    spyOn($rootScope, 'globalUser').and.returnValue({
      employeeId: '000123457S',
    });
  }));

  it('accountNumber to STAFF should prefill accountNumber', () => {
    scope.currentPayment = {
      transfer: { accountType: 'STAFF', accountNumber: '123' },
    };
    scope.accountNumber();

    expect(scope.currentPayment.transfer.accountNumber).toBe('0123457');
  });

  it('accountNumber to something not equal to STAFF should not prefill accountNumber', () => {
    scope.currentPayment = {
      transfer: { accountType: 'not-staff', accountNumber: '123' },
    };
    scope.accountNumber();

    expect(scope.currentPayment.transfer.accountNumber).toBe('');
  });
});
