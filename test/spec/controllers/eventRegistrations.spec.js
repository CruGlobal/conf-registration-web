import 'angular-mocks';

describe('Controller: eventRegistrations', function() {
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

  var openModal;
  beforeEach(inject(function($uibModal) {
    openModal = spyOn($uibModal, 'open').and.returnValue(fakeModal);
  }));

  var testData, $httpBackend, $uibModal, $controller;
  beforeEach(
    angular.mock.inject(function(
      $rootScope,
      _$controller_,
      _$uibModal_,
      _testData_,
      _$httpBackend_,
    ) {
      $controller = _$controller_;
      testData = _testData_;
      $httpBackend = _$httpBackend_;
      $uibModal = _$uibModal_;
      scope = $rootScope.$new();
      scope.registrations = [testData.registration];

      $controller('eventRegistrationsCtrl', {
        $scope: scope,
        conference: testData.conference,
        $uibModal: $uibModal,
        permissions: {},
      });
    }),
  );

  it('builtInColumnsVisible initialization', function() {
    expect(scope.builtInColumnsVisible['Email']).toBe(true);
    expect(scope.builtInColumnsVisible['Group']).toBe(true);
    expect(scope.builtInColumnsVisible['GroupId']).toBe(false);
    expect(scope.builtInColumnsVisible['Started']).toBe(true);
    expect(scope.builtInColumnsVisible['Completed']).toBe(true);
  });

  it('editRegistrant should open modal window', function() {
    var registrant = testData.registration.registrants[0];

    $httpBackend
      .whenGET(/registrations\/.*$/)
      .respond(201, [testData.registration]);

    scope.editRegistrant(registrant);
    $httpBackend.flush();

    expect(openModal).toHaveBeenCalled();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it("getGroupName should return Registration's groupName", function() {
    var id = testData.registration.id;

    expect(scope.getGroupName(id)).toBe('Test Person');
  });

  it('showGroup does not open if user has no permission', function() {
    $controller('eventRegistrationsCtrl', {
      $scope: scope,
      conference: testData.conference,
      $uibModal: $uibModal,
      permissions: { permissionInt: 2 },
    });

    scope.showGroup();

    expect(openModal.calls.mostRecent().args[0].templateUrl).not.toBe(
      'views/modals/showGroup.html',
    );
  });

  it('showGroup should open modal window', function() {
    scope.showGroup();
    expect(openModal).toHaveBeenCalled();
  });

  it('registerUser should open modal window', function() {
    scope.registerUser();
    expect(openModal).toHaveBeenCalled();
  });

  it('refreshRegistrations should assign reported attribute to registarnts', function() {
    $httpBackend
      .whenGET(/^conferences\/.*\/registrations.*/)
      .respond(201, [testData.registration]);
    scope.refreshRegistrations();
    $httpBackend.flush();
    for (const registrant of scope.registrants) {
      expect(registrant.reported).toBe(true);
    }
  });
});
