'use strict';

describe('Service: Conferences', function () {

  // load the service's module
  beforeEach(module('confRegistrationWebApp'));

  // instantiate service
  var Conferences, $httpBackend, $rootScope;
  beforeEach(inject(function (_Conferences_, _$httpBackend_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    Conferences = _Conferences_;
  }));

  it('should have a method that returns all the blocks', function () {
    var id = 'conf-1';
    var data = {
      'id': id,
      'pages': [
        {
          'blocks': [
            {
              'id': 'block-1'
            },
            {
              'id': 'block-2'
            }
          ]
        },
        {
          'blocks': [
            {
              'id': 'block-3'
            }
          ]
        }
      ]
    };
    $httpBackend.expectGET('conferences/' + id).respond(200, data);

    var conference = Conferences.get({id: id});

    $httpBackend.flush();
    $rootScope.$digest();

    expect(conference.id).not.toBeFalsy();
    expect(conference.$blocks()).not.toBeFalsy();
    expect(conference.$blocks().length).toEqual(3);
  })
});
