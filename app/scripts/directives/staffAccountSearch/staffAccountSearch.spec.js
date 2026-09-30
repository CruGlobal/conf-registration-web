import 'angular-mocks';

describe('Directive: staffAccountSearch', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, iso, $q, staffAccountService, _compile;
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

    _compile = (html) => {
      const compiled = _$compile_(html)(scope);
      scope.$digest();
      return compiled;
    };

    element = _compile(
      '<staff-account-search payment="payment.transfer" registration-id="registrationId" conference-id="conferenceId"></staff-account-search>',
    );

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

  describe('search text', () => {
    it('starts with the existing account number', () => {
      scope.payment.transfer = { accountNumber: '9870123457' };
      const editElement = _compile(
        '<staff-account-search payment="payment.transfer"></staff-account-search>',
      );

      expect(editElement.isolateScope().search.text).toBe('9870123457');
    });

    it('copies a directly typed account number to the payment method', () => {
      iso.search.text = '9870123457';
      iso.searchTextChanged();

      expect(iso.payment.accountNumber).toBe('9870123457');
    });
  });

  describe('selectStaffAccountNumber', () => {
    it('shows the designation number but sends the staff account number', () => {
      spyOn(staffAccountService, 'staffAccountNumberLookup').and.returnValue(
        $q.resolve({
          accountNumber: '9870123457',
          designationNumber: '0123457',
          message: null,
        }),
      );

      iso.selectStaffAccountNumber({ email: 'staff@cru.org' });
      scope.$apply();

      expect(staffAccountService.staffAccountNumberLookup).toHaveBeenCalledWith(
        'staff@cru.org',
        'conf-1',
      );

      expect(iso.payment.accountNumber).toBe('9870123457');
      expect(iso.payment.designationNumber).toBeUndefined();
      expect(iso.search.text).toBe('0123457');
    });

    it('shows the staff account number when there is no designation number', () => {
      spyOn(staffAccountService, 'staffAccountNumberLookup').and.returnValue(
        $q.resolve({
          accountNumber: '9870123457',
          designationNumber: '',
          message: null,
        }),
      );

      iso.selectStaffAccountNumber({ email: 'staff@cru.org' });
      scope.$apply();

      expect(iso.payment.accountNumber).toBe('9870123457');
      expect(iso.search.text).toBe('9870123457');
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
      iso.search.text = 'OLD';
      iso.staffAccountLookupMessage = 'stale error from a previous lookup';

      iso.selectStaffAccountNumber({ email: 'staff@cru.org' });

      expect(iso.staffAccountLookupMessage).toBeNull();
      expect(iso.payment.accountNumber).toBe('');
      expect(iso.search.text).toBe('');

      scope.$apply();

      expect(iso.payment.accountNumber).toBe('9870123457');
    });
  });
});
