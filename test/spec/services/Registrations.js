'use strict';

describe('Service: Registrations', function () {

  // load the service's module
  beforeEach(module('confRegistrationWebApp'));

  // instantiate service
  var Registrations, $httpBackend, $rootScope;
  beforeEach(inject(function (_Registrations_, _$httpBackend_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    Registrations = _Registrations_;
  }));

  it('should return current', function () {
    $httpBackend.expectGET('conferences/conference-1/registrations/current').respond(200, {
      id: '1234abcd',
      user: 'user-1',
      answers: []
    });

    var reg;
    Registrations.getCurrentOrCreate('conference-1').then(function (data) {
      reg = data;
    });

    $httpBackend.flush();
    $rootScope.$apply();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();

    expect(reg.id).toBeDefined();
  });



  it('should create', function () {
    $httpBackend.expectPOST('conferences/conference-1/registrations').respond(201, {
      id: '1234abcd',
      user: 'user-1',
      answers: []
    });

    var reg;
    Registrations.create('conference-1').then(function (data) {
      reg = data;
    });

    $httpBackend.flush();
    $rootScope.$apply();

    expect(reg.id).toBeDefined();
  });

  it('should create if /conf/{confId}/reg/current is 404', function () {
    $httpBackend.expectGET('conferences/conference-1/registrations/current').respond(404);
    $httpBackend.expectPOST('conferences/conference-1/registrations').respond(201, {
      id: '1234abcd',
      user: 'user-1',
      answers: []
    });
    spyOn(Registrations, 'create').andCallThrough();

    var reg;
    Registrations.getCurrentOrCreate('conference-1').then(function (data) {
      angular.forEach(data, function (value, key) {
        console.log(key);
      });
      reg = data;
    });

    $httpBackend.flush();
    $rootScope.$apply();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();

    expect(Registrations.create).toHaveBeenCalled();
  });
});
