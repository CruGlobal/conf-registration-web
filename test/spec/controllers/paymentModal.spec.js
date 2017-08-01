import 'angular-mocks';

describe('Controller: paymentModal', function () {
  var scope, modalInstance;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller, testData) {

    scope = $rootScope.$new();
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    $controller('paymentModal', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      registration: testData.registration,
      conference: {},
      permissions: {}
    });
  }));

  it('canBeRefunded should return true', function () {
    expect(scope.canBeRefunded(scope.registration.pastPayments[0])).toBe(true);
  });
});
