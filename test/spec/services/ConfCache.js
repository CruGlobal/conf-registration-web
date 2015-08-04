'use strict';

describe('Service: ConfCache', function () {

  beforeEach(module('confRegistrationWebApp'));

  var ConfCache, $rootScope, $httpBackend, deferred;
  beforeEach(inject(function (_ConfCache_, _$rootScope_, _$httpBackend_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    ConfCache = _ConfCache_;
  }));

  it('repeated calls to `get` should use cache', function () {
    $httpBackend.expectGET(/conferences\/$/).respond(201, [ { name: 'Tester', id: '456' } ]);
    ConfCache.get('');
    $httpBackend.flush();


    ConfCache.get('');
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('confCache.get should retrieve conference object', function () {
    var conference;
    ConfCache.get('c63b8abf-52ff-4cc4-afbc-5923b01f1ab0').then(function(conf){
      conference = conf;
    });
    $httpBackend.flush();

    expect(conference.id).toBe('c63b8abf-52ff-4cc4-afbc-5923b01f1ab0');
  });

  it('confCache.update should update conference object in cache', function () {
    var conferenceRename;
    var conference;
    ConfCache.get('c63b8abf-52ff-4cc4-afbc-5923b01f1ab0').then(function(conf){
      conference = conf;
    });
    $httpBackend.flush();
    conferenceRename = conference.name + ' 2';
    conference.name = conferenceRename;
    ConfCache.update('c63b8abf-52ff-4cc4-afbc-5923b01f1ab0', conference);

    ConfCache.get('c63b8abf-52ff-4cc4-afbc-5923b01f1ab0').then(function(conf){
      conference = conf;
    });

    expect(conference.name).toBe(conferenceRename);
  });
});
