'use strict';

describe('Controller: paymentModal', function () {
  var scope, modalInstance, controller;

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

    controller = $controller('paymentModal', {
      $scope: scope,
      $modalInstance: modalInstance,
      registration: testData.registration,
      conference: {},
      permissions: {}
    });
  }));

  /*6 hours behind current time, not partially refundable*/
  var payment1 = {
    transactionDatetime: new Date(new Date().getTime() - 1000 * 60 * 60 * 6).toString(),
    paymentType: 'CREDIT_CARD'
  };

  /*25 hours behind current time, partial refunds OK*/
  var payment2 = {
    transactionDatetime: new Date(new Date().getTime() - 1000 * 60 * 60 * 25).toString(),
    paymentType: 'CREDIT_CARD'
  };

  /*6 hours behind current time, but not credit card so partial refunds OK*/
  var payment3 = {
    transactionDatetime: new Date(new Date().getTime() - 1000 * 60 * 60 * 6).toString(),
    paymentType: 'CASH'
  };

  it('canBeRefunded should return true', function () {
    expect(scope.canBeRefunded(scope.registration.pastPayments[0])).toBe(true);
  });

  it('isPartialRefundAvailable should return false', function (){
    expect(scope.isPartialRefundAvailable(payment1, 'CREDIT_CARD')).toBe(false);
    expect(scope.isPartialRefundAvailable(payment1, 'CASH')).toBe(true);
    expect(scope.isPartialRefundAvailable(payment2, 'CREDIT_CARD')).toBe(true);
    expect(scope.isPartialRefundAvailable(payment3, 'CREDIT_CARD')).toBe(true);
  });
});
