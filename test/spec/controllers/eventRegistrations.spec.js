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

  it('isGroupRegistrant should return true for primary user group registrations', () => {
    let registrant = {
      registrantTypeId: '47de2c40-19dc-45b3-9663-5c005bd6464b',
    };
    let result = scope.isGroupRegistrant(registrant);
    expect(result).toBeTruthy();
  });

  it('isGroupRegistrant should return true for dependent user group registrations', () => {
    let registrant = {
      registrantTypeId: '67c70823-35bd-9262-416f-150e35a03514',
    };
    let result = scope.isGroupRegistrant(registrant);
    expect(result).toBeTruthy();
  });

  it('isGroupRegistrant should return false for not dependent and not primary user group registrations', () => {
    let registrant = {
      registrantTypeId: '2b7ca963-0503-47c4-b9cf-6348d59542c3',
    };
    let result = scope.isGroupRegistrant(registrant);
    expect(result).toBeFalsy();
  });

  it('refreshRegistrations should assign reported attribute to registrants', () => {
    $httpBackend
      .whenGET(/^conferences\/.*\/registrations.*/)
      .respond(201, [testData.registration]);
    scope.refreshRegistrations();
    $httpBackend.flush();
    for (const registrant of scope.registrants) {
      expect(registrant.reported).toBe(true);
    }
  });

  it('getRegistrationLastUpdatedTimestamp should return the latest of registrant/registration update date for primary registrant of group registration', () => {
    const registrant = testData.registration.registrants[0];
    const result_date = scope.getRegistrationLastUpdatedTimestamp(registrant);
    expect(result_date).toEqual('2015-07-10T15:06:05.383Z');
  });

  it('getRegistrationLastUpdatedTimestamp should consider answers for not primary registrant of group registration', () => {
    const registrant = testData.registration.registrants[1];
    registrant.answers[0].lastUpdatedTimestamp = '2017-07-10T15:06:05.383Z';

    const result_date = scope.getRegistrationLastUpdatedTimestamp(registrant);
    expect(result_date).toEqual('2017-07-10T15:06:05.383Z');
  });

  it('getRegistrationLastUpdatedTimestamp should consider answers for primary registrant of group registration', () => {
    const registrant = angular.copy(testData.registration.registrants[0]);
    registrant.answers[3].lastUpdatedTimestamp = '2017-07-10T15:06:05.383Z';
    const result_date = scope.getRegistrationLastUpdatedTimestamp(registrant);
    expect(result_date).toEqual('2017-07-10T15:06:05.383Z');
  });

  it('getRegistrationLastUpdatedTimestamp should consider payments for primary registrant of group registration', () => {
    const registrant = testData.registration.registrants[0];
    testData.registration.pastPayments[0].lastUpdatedTimestamp =
      '2019-07-10T15:06:05.383Z';
    const result_date = scope.getRegistrationLastUpdatedTimestamp(registrant);
    expect(result_date).toEqual('2019-07-10T15:06:05.383Z');
  });

  it('getRegistrationLastUpdatedTimestamp should not consider payments for not primary registrant of group registration', () => {
    const registrant = testData.registration.registrants[1];
    testData.registration.pastPayments[0].lastUpdatedTimestamp =
      '2019-07-10T15:06:05.383Z';
    const result_date = scope.getRegistrationLastUpdatedTimestamp(registrant);
    expect(result_date).toEqual('2012-12-21T10:23:33.494Z');
  });

  it("getRegistrationLastUpdatedTimestamp should return registrant's LastUpdatedTimestamp for not primary registrant of group registration", () => {
    const registrant = testData.registration.registrants[1];
    const result_date = scope.getRegistrationLastUpdatedTimestamp(registrant);
    expect(result_date).toEqual('2012-12-21T10:23:33.494Z');
  });

  it('getRegistrationLastUpdatedTimestamp should return the latest of two dates for not group registrant', () => {
    scope.registrations = [testData.singleRegistration];
    const registrant = testData.singleRegistration.registrants[0];
    const result_date = scope.getRegistrationLastUpdatedTimestamp(registrant);
    expect(result_date).toEqual('2015-05-15T15:23:49.846Z');
  });
});
