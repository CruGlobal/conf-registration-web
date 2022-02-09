import 'angular-mocks';

describe('Service: RegistrationCache', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var RegistrationCache, $httpBackend;
  beforeEach(inject(function (_RegistrationCache_, _$httpBackend_) {
    $httpBackend = _$httpBackend_;
    RegistrationCache = _RegistrationCache_;
  }));

  it('repeated calls to `get` should use cache', function () {
    $httpBackend
      .expectGET(/registrations\/$/)
      .respond(201, [{ name: 'Tester', id: '456' }]);
    RegistrationCache.get('');
    $httpBackend.flush();

    RegistrationCache.get('');
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});
