import 'angular-mocks';

describe('Service: JournalUpload', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let testData, $httpBackend, journalUploadService;
  beforeEach(inject((_testData_, _journalUploadService_, _$httpBackend_) => {
    $httpBackend = _$httpBackend_;
    journalUploadService = _journalUploadService_;
    testData = _testData_;
  }));

  const conferenceId = '123';
  it('gets registration data', () => {
    let registrationData;
    $httpBackend
      .expectGET(/^conferences\/.*\/registrations.*/)
      .respond(200, { registrations: [testData.singleRegistration] });
    journalUploadService.getRegistrationData(conferenceId).then((regData) => {
      registrationData = regData;
    });

    $httpBackend.flush();

    expect(registrationData.registrations[0].id).toBe(
      testData.singleRegistration.id,
    );
  });

  it('gets all account transfer reports', () => {
    let reportData;
    $httpBackend
      .expectGET(`conferences/${conferenceId}/account/transfer/reports`)
      .respond(200, testData.accountTransfersReportList);
    journalUploadService
      .getAllAccountTransferReports(conferenceId)
      .then((reports) => {
        reportData = reports;
      });

    $httpBackend.flush();

    expect(reportData[0].id).toBe(testData.accountTransfersReportList[0].id);
  });

  it('gets a specific account transfer report', () => {
    let reportData;
    $httpBackend
      .expectGET(
        `/conferences/${conferenceId}/account/transfer/report/08eb91d4-265c-46f0-a337-f41d904a5757`,
      )
      .respond(200, testData.accountTransferReport);

    journalUploadService
      .getAccountTransferReport(
        `/conferences/${conferenceId}/account/transfer/report/08eb91d4-265c-46f0-a337-f41d904a5757`,
      )
      .then((report) => {
        reportData = report;
      });

    $httpBackend.flush();

    expect(reportData.id).toBe(testData.accountTransferReport.id);
  });

  it('gets all account transfers with errors', () => {
    let accountTransfers;
    accountTransfers = journalUploadService.getAccountTransferDataWithErrors({
      registrations: [testData.singleRegistration],
    });

    expect(accountTransfers).toEqual([
      testData.singleRegistration.accountTransfers[1],
    ]);
  });
});
