'use strict';

describe('Controller: paymentModal', function () {
  var scope, controller;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller, testData) {

    scope = $rootScope.$new();

    controller = $controller('eventDetailsCtrl', {
      $scope: scope,
      conference: testData.conference,
      permissions: {}
    });
  }));

  it('changeTab() should change tab', function () {
    scope.changeTab('paymentOptions');
    expect(scope.activeTab).toBe('paymentOptions');
  });

  it('addRegType should add reg type', function () {
    var totalRegTypes = scope.conference.registrantTypes.length;
    scope.addRegType();
    expect(scope.conference.registrantTypes.length).toBe(totalRegTypes + 1);
  });

  it('deleteRegType should remove reg type', function () {
    var totalRegTypes = scope.conference.registrantTypes.length;
    scope.deleteRegType(scope.conference.registrantTypes[0].id);
    expect(scope.conference.registrantTypes.length).toBe(totalRegTypes - 1);
  });

  it('anyPaymentMethodAccepted should be true', function () {
    expect(scope.anyPaymentMethodAccepted(scope.conference.registrantTypes[0])).toBe(true);
  });

  it('acceptedPaymentMethods() should return 4 payments', function () {
    expect(Object.keys(scope.acceptedPaymentMethods()).length).toBe(4);
  });

});