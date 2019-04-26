import 'angular-mocks';

describe('Controller: registrationModal', function() {
  var scope, modalInstance, modalMessage, testData;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(function(
      $rootScope,
      $controller,
      _testData_,
      _modalMessage_,
    ) {
      scope = $rootScope.$new();
      modalInstance = {
        close: jasmine.createSpy('modalInstance.close'),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then'),
        },
      };
      testData = _testData_;
      modalMessage = _modalMessage_;

      $controller('registrationModal', {
        $scope: scope,
        $uibModalInstance: modalInstance,
        modalMessage: modalMessage,
        conference: testData.conference,
        primaryRegistration: null,
        typeId: null,
      });
    }),
  );

  it('register should close the modal', function() {
    scope.register();

    expect(modalInstance.dismiss).toHaveBeenCalled();
  });
});
