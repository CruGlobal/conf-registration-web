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
        registrationsData: { registrations: [testData.singleRegistration] },
        conference: testData.conference,
        reports: testData.accountTransfersReportList,
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
    expect(scope.reports.length).toBeGreaterThan(0);
  });

  describe('account transfer reports', () => {
    it('sets accountTransfers to specific reports accountTransfers', () => {
      scope.accountTransfers[testData.singleRegistration.accountTransfers];

      expect(scope.currentReportId).toEqual(null);

      scope.currentReportId = '59d56562-b97e-4cc8-a6f3-305f207042a4';

      scope.$digest();

      expect(scope.accountTransfers).toEqual([
        testData.accountTransfersReportList[0].accountTransfers[0],
      ]);

      expect(scope.accountTransfersWithErrors).toEqual([
        testData.accountTransfersReportList[0].accountTransfers[1],
      ]);
    });

    it('refreshes account transfer data if currentReportId is set to null', () => {
      scope.currentReportId = '59d56562-b97e-4cc8-a6f3-305f207042a4';

      scope.$digest();

      expect(scope.accountTransfers).toEqual([
        testData.accountTransfersReportList[0].accountTransfers[0],
      ]);

      expect(scope.accountTransfersWithErrors).toEqual([
        testData.accountTransfersReportList[0].accountTransfers[1],
      ]);

      $httpBackend
        .whenGET(/^conferences\/.*\/registrations.*/)
        .respond(201, { registrations: [testData.singleRegistration] });

      scope.currentReportId = null;

      $httpBackend.flush();

      scope.$digest();

      expect(scope.currentReportId).toEqual(null);

      expect(scope.accountTransfers[0].id).toEqual(
        testData.singleRegistration.accountTransfers[0].id,
      );
    });
  });

  describe('accountTransfersToInclude', () => {
    it('adds a single account transfer to accountTransfersToInclude', () => {
      scope.accountTransfers = [testData.singleRegistration.accountTransfers];
      scope.accountTransfersToInclude = [];

      scope.refreshAccountTransfersToInclude(scope.accountTransfers[0]);

      scope.refresh();

      expect(scope.accountTransfersToInclude.length).toBeGreaterThan(0);
      expect(scope.accountTransfersToInclude).toContain(
        scope.accountTransfers[0],
      );
    });

    it('removes a single account transfer from accountTransfersToInclude', () => {
      scope.accountTransfers = [testData.singleRegistration.accountTransfers];
      scope.accountTransfersToInclude = [
        testData.singleRegistration.accountTransfers,
      ];

      scope.refreshAccountTransfersToInclude(scope.accountTransfers[0]);

      scope.refresh();

      expect(scope.accountTransfersToInclude.length).toBe(0);
      expect(scope.accountTransfersToInclude).toEqual([]);
    });

    it('returns true if all account transfers have been added to accountTransfersToInclude', () => {
      scope.accountTransfers = [testData.singleRegistration.accountTransfers];
      scope.accountTransfersToInclude = [
        testData.singleRegistration.accountTransfers,
      ];

      const result = scope.allAccountTransfersIncluded();

      expect(result).toBeTruthy();
    });

    it('returns false if all account transfers have not been added to accountTransfersToInclude', () => {
      scope.accountTransfers = [testData.singleRegistration.accountTransfers];
      scope.accountTransfersToInclude = [];

      const result = scope.allAccountTransfersIncluded();

      expect(result).toBeFalsy();
    });

    it('adds all account transfers to accountTransfersToInclude', () => {
      scope.accountTransfers = [testData.singleRegistration.accountTransfers];
      scope.accountTransfersToInclude = [];

      scope.addAllTransfersToInclude();

      scope.refresh();

      expect(scope.accountTransfersToInclude.length).toEqual(
        scope.accountTransfers.length,
      );
    });

    it('removes all account transfers from accountTransfersToInclude', () => {
      scope.accountTransfers = [testData.singleRegistration.accountTransfers];
      scope.accountTransfersToInclude = [
        testData.singleRegistration.accountTransfers,
      ];

      scope.removeAllTransfersFromToInclude();

      scope.refresh();

      expect(scope.accountTransfersToInclude.length).toEqual(0);
      expect(scope.accountTransfersToInclude).toEqual([]);
    });

    it('gets remaining balance for account transfer', () => {
      const result = scope.getRemainingBalance(testData.singleRegistration.id);

      expect(result).toEqual(testData.singleRegistration.remainingBalance);
    });
  });
});
