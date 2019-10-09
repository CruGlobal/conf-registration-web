import 'angular-mocks';

describe('Controller: paymentReportCtrl', function() {
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

      $controller('paymentReportCtrl', {
        $scope: scope,
        report: testData.report,
        reportList: testData.reports,
        permissions: {},
        confId: '123456',
      });
    }),
  );

  it('refresh should call api and refresh scope data', function() {
    scope.report = {};
    scope.reports = [];
    $httpBackend
      .whenGET(/^conferences\/[-a-zA-Z0-9]+\/payments\/report\/new\.*/)
      .respond(201, testData.report);
    $httpBackend
      .whenGET(/^conferences\/[-a-zA-Z0-9]+\/payments\/report\.*/)
      .respond(201, testData.reports);

    scope.refresh();
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();

    expect(scope.reports.length).toBeGreaterThan(0);
    expect(scope.report.conferenceLongName).toBe('Payment Event');
  });

  it('exportUrl should create link for the latest payment report', function() {
    let exportUrl = scope.exportUrl();
    expect(exportUrl).toContain(
      'eventhub-api/rest/conferences/41a2226f-6416-4b82-92c1-7a6a62327d48/payments/report/export?Authorization=undefined',
    );
  });

  it('exportUrl should create link for locked payment report', function() {
    scope.queryParameters.currentReportId = 'id';
    let exportUrl = scope.exportUrl();
    expect(exportUrl).toContain(
      'eventhub-api/rest/conferences/41a2226f-6416-4b82-92c1-7a6a62327d48/payments/report/export/id?Authorization=undefined',
    );
  });

  it('lock report', function() {
    $httpBackend
      .whenPOST(/^conferences\/[-a-zA-Z0-9]+\/payments\/report\/lock\.*/, {})
      .respond(201, 'locked-id');
    scope.lock();
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();

    expect(scope.queryParameters.currentReportId).toBe('locked-id');
    expect(scope.excludedIds).toEqual({});
  });
});
