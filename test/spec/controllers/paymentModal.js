'use strict';

describe('Controller: paymentModal', function () {
  var scope, modalInstance, controller;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {

    scope = $rootScope.$new();
    modalInstance = {
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then')
      }
    };

    controller = $controller('paymentModal', {
      $scope: scope,
      $modalInstance: modalInstance,
      registration: testRegistration,
      conference: {},
      permissions: {}
    });
  }));

  it('canBeRefunded should return true', function () {
    expect(scope.canBeRefunded(scope.registration.pastPayments[0])).toBe(true);
  });
});