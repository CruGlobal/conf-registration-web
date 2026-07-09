import 'angular-mocks';

describe('Service: staffAccountService', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var staffAccountService, $httpBackend;
  beforeEach(inject((_staffAccountService_, _$httpBackend_) => {
    staffAccountService = _staffAccountService_;
    $httpBackend = _$httpBackend_;
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('searchStaff', () => {
    it('searches staff by name for the given registration', () => {
      var result;
      $httpBackend
        .expectGET(/registrations\/reg-1\/staffsearch\?name=john/)
        .respond(200, [{ firstName: 'John', lastName: 'Doe' }]);

      staffAccountService.searchStaff('john', 'reg-1').then((lookupResult) => {
        result = lookupResult;
      });
      $httpBackend.flush();

      expect(result).toEqual([{ firstName: 'John', lastName: 'Doe' }]);
    });
  });

  describe('staffAccountNumberLookup', () => {
    it('returns the staff account number on success (200)', () => {
      var result;
      $httpBackend
        .expectGET(/staffAccountNumber\?email=staff@cru\.org/)
        .respond(200, { staffAccountNumber: '9870123457' });

      staffAccountService
        .staffAccountNumberLookup('staff@cru.org', 'conf-1')
        .then((lookupResult) => {
          result = lookupResult;
        });
      $httpBackend.flush();

      expect(result).toEqual({ accountNumber: '9870123457', message: null });
    });

    it('returns a message when no staff member is found (204)', () => {
      var result;
      $httpBackend
        .expectGET(/staffAccountNumber\?email=staff@cru\.org/)
        .respond(204, '');

      staffAccountService
        .staffAccountNumberLookup('staff@cru.org', 'conf-1')
        .then((lookupResult) => {
          result = lookupResult;
        });
      $httpBackend.flush();

      expect(result).toEqual({
        accountNumber: '',
        message: 'No staff member was found with that email address.',
      });
    });

    it('returns a permission message when the lookup is forbidden (403)', () => {
      var result;
      $httpBackend
        .expectGET(/staffAccountNumber\?email=staff@cru\.org/)
        .respond(403, '');

      staffAccountService
        .staffAccountNumberLookup('staff@cru.org', 'conf-1')
        .then((lookupResult) => {
          result = lookupResult;
        });
      $httpBackend.flush();

      expect(result).toEqual({
        accountNumber: '',
        message:
          'You do not have admin permission to look up staff accounts for this event.',
      });
    });

    it('returns a not found message for not found (404)', () => {
      var result;
      $httpBackend
        .expectGET(/staffAccountNumber\?email=staff@cru\.org/)
        .respond(404, '');

      staffAccountService
        .staffAccountNumberLookup('staff@cru.org', 'conf-1')
        .then((lookupResult) => {
          result = lookupResult;
        });
      $httpBackend.flush();

      expect(result).toEqual({
        accountNumber: '',
        message: 'Unable to find a staff account number for this staff member.',
      });
    });

    it('returns a generic error message for other errors', () => {
      var result;
      $httpBackend
        .expectGET(/staffAccountNumber\?email=staff@cru\.org/)
        .respond(500, '');

      staffAccountService
        .staffAccountNumberLookup('staff@cru.org', 'conf-1')
        .then((lookupResult) => {
          result = lookupResult;
        });
      $httpBackend.flush();

      expect(result).toEqual({
        accountNumber: '',
        message: 'An error occurred while looking up the staff account number.',
      });
    });
  });
});
