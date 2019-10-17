import 'angular-mocks';

describe('Controller: paymentModal', function() {
  var scope;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var fakeModal = {
    result: {
      then: function(confirmCallback, cancelCallback) {
        this.confirmCallBack = confirmCallback;
        this.cancelCallback = cancelCallback;
      },
    },
    close: function(item) {
      this.result.confirmCallBack(item);
    },
    dismiss: function(type) {
      this.result.cancelCallback(type);
    },
  };

  beforeEach(inject(function($uibModal) {
    spyOn($uibModal, 'open').and.returnValue(fakeModal);
  }));

  var testData;
  beforeEach(
    angular.mock.inject(function(
      $rootScope,
      $controller,
      _$uibModal_,
      _testData_,
    ) {
      testData = _testData_;
      scope = $rootScope.$new();

      $controller('eventDetailsCtrl', {
        $scope: scope,
        conference: testData.conference,
        currencies: testData.currencies,
        $uibModal: _$uibModal_,
        permissions: {},
      });
    }),
  );

  it('changeTab() should change tab', function() {
    scope.changeTab('paymentOptions');
    expect(scope.activeTab).toBe('paymentOptions');
  });

  it('addRegType should add reg type', function() {
    var totalRegTypes = scope.conference.registrantTypes.length;

    var modal = scope.addRegType();
    modal.close({
      name: 'Additional Type',
      defaultTypeKey: '',
    });

    expect(scope.conference.registrantTypes.length).toBe(totalRegTypes + 1);
  });

  it('deleteRegType should remove reg type', function() {
    var totalRegTypes = scope.conference.registrantTypes.length;
    scope.deleteRegType(scope.conference.registrantTypes[0].id);
    expect(scope.conference.registrantTypes.length).toBe(totalRegTypes - 1);
  });

  it('anyPaymentMethodAccepted should be true', function() {
    expect(
      scope.anyPaymentMethodAccepted(scope.conference.registrantTypes[0]),
    ).toBe(true);
  });

  it("getPaymentGatewayType should return the conference's paymentGatewayType", function() {
    expect(scope.getPaymentGatewayType()).toBe(
      testData.conference.paymentGatewayType,
    );
  });
});
