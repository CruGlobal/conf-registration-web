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

  let testData;
  let $httpBackend;

  beforeEach(
    angular.mock.inject(function(
      $rootScope,
      $controller,
      _$uibModal_,
      _testData_,
      _$httpBackend_,
    ) {
      testData = _testData_;
      scope = $rootScope.$new();
      $httpBackend = _$httpBackend_;

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

  it('saveEvent() should validate the conference', () => {
    scope.saveEvent();

    expect(scope.notify.message.toString()).toContain(
      'Please enter Ministry Hosting Event.',
    );

    expect(scope.notify.message.toString()).toContain(
      'Please enter Ministry Purpose.',
    );
  });

  it('setPristine() should pristine the form', () => {
    scope.eventDetails = {
      $setPristine() {},
    };

    const setPristine = spyOn(scope.eventDetails, '$setPristine');

    scope.setPristine();

    expect(setPristine).toHaveBeenCalledWith();
  });

  it('resetImage should set image and includeImageToAllPages to the value taken from the conference', () => {
    scope.image.includeImageToAllPages = false;
    scope.image.imageSrc = 'new-image';
    scope.resetImage();
    expect(scope.image.includeImageToAllPages).toEqual(
      scope.conference.image.includeImageToAllPages,
    );
    expect(scope.image.image).toEqual(scope.conference.image.image);
  });

  it('saveImage should save image and includeImageToAllPages', () => {
    scope.image.includeImageToAllPages = false;
    scope.image.image = 'new-image';
    $httpBackend
      .whenPUT(/^conferences\/[-a-zA-Z0-9]+\/image\.*/)
      .respond((verb, url, data) => {
        return [200, data, {}];
      });
    scope.saveImage();

    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    expect(scope.image.includeImageToAllPages).toEqual(
      scope.conference.image.includeImageToAllPages,
    );
    expect(scope.image.image).toEqual(scope.conference.image.image);
  });

  it('deleteImage should delete image and set includeImageToAllPages to false', () => {
    $httpBackend
      .whenPUT(/^conferences\/[-a-zA-Z0-9]+\/image\.*/)
      .respond((verb, url, data) => {
        return [200, data, {}];
      });
    scope.deleteImage();

    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    expect(scope.conference.image.includeImageToAllPages).toEqual(false);
    expect(scope.conference.image.image).toEqual('');
  });
});
