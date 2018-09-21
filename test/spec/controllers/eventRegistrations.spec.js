import 'angular-mocks';

describe('Controller: eventRegistrations', function () {
  var scope;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var fakeModal = {
    result: {
      then: function(confirmCallback, cancelCallback) {
        this.confirmCallBack = confirmCallback;
        this.cancelCallback = cancelCallback;
      }
    },
    close: function( item ) {
      this.result.confirmCallBack( item );
    },
    dismiss: function( type ) {
      this.result.cancelCallback( type );
    }
  };

  var openModal;
  beforeEach(inject(function($uibModal) {
    openModal = spyOn($uibModal, 'open').and.returnValue(fakeModal);
  }));

  var testData;
  beforeEach(angular.mock.inject(function($rootScope, $controller, _$uibModal_, _testData_) {
    testData = _testData_;
    scope = $rootScope.$new();
    scope.registrations = [testData.registration];

    $controller('eventRegistrationsCtrl', {
      $scope: scope,
      conference: testData.conference,
      $uibModal: _$uibModal_,
      permissions: {}
    });
  }));

  it('builtInColumnsVisible initialization', function() {
    expect(scope.builtInColumnsVisible['Email']).toBe(true);
    expect(scope.builtInColumnsVisible['Group']).toBe(true);
    expect(scope.builtInColumnsVisible['GroupId']).toBe(false);
    expect(scope.builtInColumnsVisible['Started']).toBe(true);
    expect(scope.builtInColumnsVisible['Completed']).toBe(true);
  });


  it('getGroupName should return Registration\'s groupName', function () {
    var id = testData.registration.id;

    expect(scope.getGroupName(id)).toBe('Test Person');
  });

  it('showGroup should open modal window', function () {
    scope.showGroup();
    expect(openModal).toHaveBeenCalled();
  });
});
