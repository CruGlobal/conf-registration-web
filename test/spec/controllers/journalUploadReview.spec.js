import 'angular-mocks';

describe('Controller: journalUploadReviewModal', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let scope, modalInstance, $controller, testData;
  let queryParameters = { filterAccountTransferErrors: 'yes' };
  beforeEach(
    angular.mock.inject(function ($rootScope, _$controller_, _testData_) {
      scope = $rootScope.$new();
      modalInstance = {
        close: jasmine.createSpy('modalInstance.close'),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then'),
        },
      };
      testData = _testData_;
      $controller = _$controller_;

      $controller('journalUploadReviewModal', {
        $scope: scope,
        $uibModalInstance: modalInstance,
        conference: testData.conference,
        queryParameters,
        report: testData.accountTransferReport,
      });
    }),
  );

  it('should close the modal when close() runs', () => {
    scope.close();

    expect(modalInstance.close).toHaveBeenCalledWith();
  });

  it('should update queryParameters when viewErrors() runs', () => {
    scope.viewErrors();

    expect(queryParameters.filterAccountTransferErrors).toEqual('only');
    expect(modalInstance.close).toHaveBeenCalledWith();
  });

  it('should pass the report id back when viewReport() runs', () => {
    scope.viewReport();

    expect(modalInstance.close).toHaveBeenCalledWith(
      testData.accountTransferReport.id,
    );
  });

  it('should count successes and errors for journal reports', () => {
    expect(scope.successCount).toBe(1);
    expect(scope.errorCount).toBe(1);
  });

  it('should count successes and errors for promo reports', () => {
    scope.report.accountTransfers = null;
    scope.report.promotionRegistrationInfoList = [
      {
        registrationId: 'registration-1',
        promotionId: 'promotion-1',
      },
      {
        registrationId: 'registration-1',
        promotionId: 'promotion-2',
      },
      {
        registrationId: 'registration-1',
        promotionId: 'promotion-3',
        error: 'Error',
      },
    ];

    $controller('journalUploadReviewModal', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      conference: testData.conference,
      queryParameters,
      report: testData.accountTransferReport,
    });

    expect(scope.successCount).toBe(2);
    expect(scope.errorCount).toBe(1);
  });
});
