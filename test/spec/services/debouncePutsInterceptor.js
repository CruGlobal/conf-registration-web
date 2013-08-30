'use strict';

describe('Service: debouncePutsInterceptor', function () {

  // load the service's module
  beforeEach(module('confRegistrationWebApp'));

  // instantiate service
  var debouncePutsInterceptor, $q, $rootScope, $timeout;
  beforeEach(inject(function (_debouncePutsInterceptor_, _$q_, _$rootScope_, _$timeout_) {
    $timeout = _$timeout_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    debouncePutsInterceptor = _debouncePutsInterceptor_;
  }));

  it('allow one request immediately', function () {
    var config = {
      method: 'PUT',
      url: 'http://test'
    };

    var resolved;
    $q.when(debouncePutsInterceptor.request(config)).then(function () {
      resolved = true;
    });
    $rootScope.$digest();

    expect(resolved).toBeTruthy();
  });

  it('allow second request immediately if there is sufficient delay', function () {
    var config = {
      method: 'PUT',
      url: 'http://test'
    };

    var firstRequestDone, secondRequestDone;
    $q.when(debouncePutsInterceptor.request(config)).then(function () {
      firstRequestDone = true;
    });
    $timeout.flush();
    $rootScope.$digest();
    $q.when(debouncePutsInterceptor.request(config)).then(function () {
      secondRequestDone = true;
    });
    $rootScope.$digest();

    expect(secondRequestDone).toBeTruthy();
  });

  it('delay a second request', function () {
    var config = {
      method: 'PUT',
      url: 'http://test'
    };

    var firstRequestDone, secondRequestDone;
    $q.when(debouncePutsInterceptor.request(config)).then(function () {
      firstRequestDone = true;
    });
    $q.when(debouncePutsInterceptor.request(config)).then(function () {
      secondRequestDone = true;
    });
    $rootScope.$digest();

    expect(secondRequestDone).toBeUndefined();

    $timeout.flush();
    $rootScope.$digest();

    expect(secondRequestDone).toBeTruthy();
  });

  it('cancel the second request if there is a third', function () {
    var config = {
      method: 'PUT',
      url: 'http://test'
    };

    var firstRequestDone, secondRequestRejected, thirdRequestDone;
    $q.when(debouncePutsInterceptor.request(config)).then(function () {
      firstRequestDone = true;
    });
    $q.when(debouncePutsInterceptor.request(config)).then(angular.noop, function () {
      secondRequestRejected = true;
    });
    $q.when(debouncePutsInterceptor.request(config)).then(function () {
      thirdRequestDone = true;
    });
    $rootScope.$digest();


    $timeout.flush();
    $rootScope.$digest();

    expect(secondRequestRejected).toBeTruthy();
    expect(thirdRequestDone).toBeTruthy();
  });

});
