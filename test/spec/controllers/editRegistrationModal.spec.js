import 'angular-mocks';

describe('Controller: editRegistrationModalCtrl', function () {
  var scope, modalInstance, modalMessage;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller, testData, _modalMessage_) {

    scope = $rootScope.$new();
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };
    modalMessage = _modalMessage_;

    $controller('editRegistrationModalCtrl', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      modalMessage: modalMessage,
      conference: {},
      registration: testData.registration,
      registrantId: testData.registration.registrants[0],
      enableDelete: true
    });
  }));

  it('delete should show confirm window', function () {
    var confirmWindow = spyOn(modalMessage, 'confirm').and.callThrough();

    scope.delete();

    expect(confirmWindow).toHaveBeenCalled();
  });
});
