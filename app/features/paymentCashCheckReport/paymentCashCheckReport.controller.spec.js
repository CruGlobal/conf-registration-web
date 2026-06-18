import 'angular-mocks';

describe('Controller: paymentCashCheckReportCtrl', function () {
  var scope;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var testData, $httpBackend, $controller;
  beforeEach(
    angular.mock.inject(function (
      $rootScope,
      _$controller_,
      _testData_,
      _$httpBackend_,
    ) {
      $controller = _$controller_;
      testData = _testData_;
      $httpBackend = _$httpBackend_;
      scope = $rootScope.$new();

      $httpBackend
        .whenGET(/^conferences\/[-a-zA-Z0-9]+\/payments\/report\/new\.*/)
        .respond(201, testData.report);
      $httpBackend
        .whenGET(/^conferences\/[-a-zA-Z0-9]+\/payments\/report/)
        .respond(201, testData.reports);

      $controller('paymentCashCheckReportCtrl', {
        $scope: scope,
        report: testData.report,
        reportList: testData.reports,
        conference: testData.conference,
        permissions: {},
        confId: '123456',
      });
    }),
  );

  it('refresh should call api and refresh scope data', function () {
    scope.report = {};
    scope.reports = [];

    scope.refresh();
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();

    expect(scope.reports.length).toBeGreaterThan(0);

    expect(scope.report.conferenceLongName).toBe('Payment Event');
  });

  it('exportUrl should create link for the latest payment report', function () {
    let exportUrl = scope.exportUrl();

    expect(exportUrl).toContain(
      'eventhub-api/rest/conferences/41a2226f-6416-4b82-92c1-7a6a62327d48/payments/report/export?Authorization=undefined',
    );
  });

  it('exportUrl should create link for locked payment report if it is selected', function () {
    scope.queryParameters.currentReportId = 'id';
    let exportUrl = scope.exportUrl();

    expect(exportUrl).toContain(
      'eventhub-api/rest/conferences/41a2226f-6416-4b82-92c1-7a6a62327d48/payments/report/export/id?Authorization=undefined',
    );
  });

  it('noDataForLocking method should return true if report is locked', function () {
    scope.queryParameters.currentReportId = 'report-id';
    let noDataForLocking = scope.noDataForLocking();

    expect(noDataForLocking).toEqual(true);
  });

  it('noDataForLocking method should return false if some payments are selected', function () {
    scope.queryParameters.currentReportId = null;
    scope.excludedIds = { 'da0235f3-469d-42a3-9014-ca1a47a9f048': true };
    let noDataForLocking = scope.noDataForLocking();

    expect(noDataForLocking).toEqual(false);
  });

  it('noDataForLocking method should return true if no payments are selected', function () {
    scope.queryParameters.currentReportId = null;
    scope.excludedIds = {};
    for (const report of scope.report.paymentReportEntries) {
      scope.refreshExcludedIds(report.paymentId);
    }

    let noDataForLocking = scope.noDataForLocking();

    expect(noDataForLocking).toEqual(true);
  });

  it('lock report', function () {
    $httpBackend
      .whenPOST(/^conferences\/[-a-zA-Z0-9]+\/payments\/report\/lock\.*/, {})
      .respond(201, 'locked-id');
    scope.lock();
    // Flush the lock request
    $httpBackend.flush();
    // Flush the refresh request triggered by lock updating the query parameters
    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();

    expect(scope.queryParameters.currentReportId).toBe('locked-id');

    expect(scope.excludedIds).toEqual({});
  });

  it('should call get report api with correct page number', function () {
    scope.queryParameters.page = 1;
    $httpBackend
      .expectGET(/^conferences\/[-a-zA-Z0-9]+\/payments\/report\/new.*page=1.*/)
      .respond(201, testData.report);
    $httpBackend.flush();
    scope.queryParameters.page = 2;
    $httpBackend
      .expectGET(/^conferences\/[-a-zA-Z0-9]+\/payments\/report\/new.*page=2.*/)
      .respond(201, testData.reports);
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
});
