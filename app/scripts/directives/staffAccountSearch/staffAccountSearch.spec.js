import 'angular-mocks';

describe('Directive: staffAccountSearch', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, iso, $q, staffAccountService;
  beforeEach(inject(function (
    _$rootScope_,
    _$compile_,
    _$q_,
    $templateCache,
    _staffAccountService_,
  ) {
    $q = _$q_;
    staffAccountService = _staffAccountService_;

    scope = _$rootScope_.$new();
    $templateCache.put(
      'scripts/directives/staffAccountSearch/staffAccountSearch.html',
      '',
    );

    scope.payment = { transfer: {} };
    scope.registrationId = 'reg-1';
    scope.conferenceId = 'conf-1';

    element = _$compile_(
      '<staff-account-search payment="payment.transfer" registration-id="registrationId" conference-id="conferenceId"></staff-account-search>',
    )(scope);
    scope.$digest();

    iso = element.isolateScope();
  }));

  describe('searchStaff', () => {
    it('delegates to staffAccountService with the registration id', () => {
      spyOn(staffAccountService, 'searchStaff').and.returnValue(
        $q.resolve([{ firstName: 'John', lastName: 'Doe' }]),
      );

      iso.searchStaff('john');

      expect(staffAccountService.searchStaff).toHaveBeenCalledWith(
        'john',
        'reg-1',
      );
    });
  });

  describe('selectStaffAccountNumber', () => {
    it('applies the looked up account number to the payment method', () => {
      spyOn(staffAccountService, 'staffAccountNumberLookup').and.returnValue(
        $q.resolve({ accountNumber: '9870123457', message: null }),
      );

      iso.selectStaffAccountNumber({ email: 'staff@cru.org' });
      scope.$apply();

      expect(staffAccountService.staffAccountNumberLookup).toHaveBeenCalledWith(
        'staff@cru.org',
        'conf-1',
      );

      expect(iso.payment.accountNumber).toBe('9870123457');
    });

    it('displays the lookup message and leaves the account number empty', () => {
      spyOn(staffAccountService, 'staffAccountNumberLookup').and.returnValue(
        $q.resolve({
          accountNumber: '',
          message: 'No staff member was found with that email address.',
        }),
      );

      iso.selectStaffAccountNumber({ email: 'staff@cru.org' });
      scope.$apply();

      expect(iso.payment.accountNumber).toBe('');
      expect(iso.staffAccountLookupMessage).toBe(
        'No staff member was found with that email address.',
      );
    });

    it('clears any prior lookup message before the new lookup resolves', () => {
      spyOn(staffAccountService, 'staffAccountNumberLookup').and.returnValue(
        $q.resolve({ accountNumber: '9870123457', message: null }),
      );
      iso.payment.accountNumber = 'OLD';
      iso.staffAccountLookupMessage = 'stale error from a previous lookup';

      iso.selectStaffAccountNumber({ email: 'staff@cru.org' });

      expect(iso.staffAccountLookupMessage).toBeNull();
      expect(iso.payment.accountNumber).toBe('');

      scope.$apply();

      expect(iso.payment.accountNumber).toBe('9870123457');
    });
  });
});
