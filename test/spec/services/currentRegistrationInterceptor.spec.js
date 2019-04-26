import 'angular-mocks';

describe('Service: currentRegistrationInterceptor', function() {
  // load the service's module
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  // instantiate service
  var currentRegistrationInterceptor, $httpBackend, $rootScope;
  beforeEach(inject(function(
    _currentRegistrationInterceptor_,
    _$httpBackend_,
    _$rootScope_,
  ) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    currentRegistrationInterceptor = _currentRegistrationInterceptor_;
  }));

  it('should not interrupt errors that are not 404', function() {
    var rejection = {
      status: 400,
      config: {
        url: 'conferences/1/registrations/current',
      },
    };

    var rejected;
    currentRegistrationInterceptor
      .responseError(rejection)
      .then(null, function() {
        rejected = true;
      });

    $rootScope.$digest();

    // expect no HTTP requests
    expect(rejected).toBeTruthy();
  });

  it('should not interrupt errors that are not responses to other urls', function() {
    var rejection = {
      status: 404,
      config: {
        url: 'conferences/1/registrations',
      },
    };

    var rejected;
    currentRegistrationInterceptor
      .responseError(rejection)
      .then(null, function() {
        rejected = true;
      });

    $rootScope.$digest();

    // expect no HTTP requests
    expect(rejected).toBeTruthy();
  });

  it('should interrupt a 404 from the current registration url', function() {
    var rejection = {
      status: 404,
      config: {
        url: 'conferences/1/registrations/current',
      },
    };
    $httpBackend.expectPOST(/conferences\/1\/registrations$/).respond(201, {
      id: '1234abcd',
      user: 'user-1',
      conference: '1',
      answers: [],
    });

    var rejected;
    var resolved;
    currentRegistrationInterceptor.responseError(rejection).then(
      function() {
        resolved = true;
      },
      function() {
        rejected = true;
      },
    );

    $httpBackend.flush();
    $rootScope.$digest();

    // expect no HTTP requests
    expect(resolved).toBeTruthy();
    expect(rejected).toBeFalsy();
  });

  it('should work even if the url ends in a slash', function() {
    var rejection = {
      status: 404,
      config: {
        url: 'conferences/1/registrations/current/',
      },
    };
    $httpBackend.expectPOST(/conferences\/1\/registrations$/).respond(201, {
      id: '1234abcd',
      user: 'user-1',
      conference: '1',
      answers: [],
    });

    var rejected;
    var resolved;
    currentRegistrationInterceptor.responseError(rejection).then(
      function() {
        resolved = true;
      },
      function() {
        rejected = true;
      },
    );

    $httpBackend.flush();
    $rootScope.$digest();

    // expect no HTTP requests
    expect(resolved).toBeTruthy();
    expect(rejected).toBeFalsy();
  });
});
