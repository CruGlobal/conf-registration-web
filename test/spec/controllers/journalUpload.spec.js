import 'angular-mocks';

describe('Controller: journalUploadCtrl', function() {
  var scope;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var testData, $httpBackend, $controller;
  beforeEach(
    angular.mock.inject(function(
      $rootScope,
      _$controller_,
      _testData_,
      _$httpBackend_,
    ) {
      $controller = _$controller_;
      testData = _testData_;
      $httpBackend = _$httpBackend_;
      scope = $rootScope.$new();

      $controller('journalUploadCtrl', {
        $scope: scope,
        registrations: { registrations: [testData.singleRegistration] },
        conference: testData.conference,
        permissions: {},
        confId: '123456',
      });
    }),
  );

  it('refresh should call api and refresh scope data', () => {
    scope.accountTransfers = [];

    $httpBackend
      .whenGET(/^conferences\/.*\/registrations.*/)
      .respond(201, { registrations: [testData.singleRegistration] });

    scope.refresh();
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();

    expect(scope.accountTransfers.length).toBeGreaterThan(0);

    expect(scope.accountTransfers[0].remainingBalance).toBe(49.0);
  });
});
