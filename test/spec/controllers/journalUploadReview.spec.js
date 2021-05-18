import 'angular-mocks';

describe('Controller: journalUploadReviewModal', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let scope, modalInstance, testData;
  let queryParameters = { filterAccountTransferErrors: 'yes' };
  beforeEach(
    angular.mock.inject(function($rootScope, $controller, _testData_) {
      scope = $rootScope.$new();
      modalInstance = {
        close: jasmine.createSpy('modalInstance.close'),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then'),
        },
      };
      testData = _testData_;

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
});
