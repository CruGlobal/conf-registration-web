import 'angular-mocks';

describe('app_enforceAuth $routeChangeError', () => {
  let $rootScope, $location, $window;

  beforeEach(
    angular.mock.module('confRegistrationWebApp', ($provide) => {
      $provide.value('$window', {
        history: { back: jasmine.createSpy('back') },
        location: { href: '' },
      });
    }),
  );

  beforeEach(inject((_$rootScope_, _$location_, _$window_) => {
    $rootScope = _$rootScope_;
    $location = _$location_;
    $window = _$window_;
    spyOn($location, 'path').and.callThrough();
  }));

  it('goes back when there is a previous route', () => {
    $rootScope.$broadcast(
      '$routeChangeError',
      {},
      // eslint-disable-next-line angular/no-private-call
      { $$route: { originalPath: '/eventDashboard' } },
    );

    expect($window.history.back).toHaveBeenCalledWith();
  });

  it('goes home when there is no previous route', () => {
    $rootScope.$broadcast('$routeChangeError', {}, undefined);

    expect($window.history.back).not.toHaveBeenCalled();
    expect($location.path).toHaveBeenCalledWith('/');
  });

  it('goes home instead of back when the previous route was the sign in redirect', () => {
    $rootScope.$broadcast(
      '$routeChangeError',
      {},
      // eslint-disable-next-line angular/no-private-call
      { $$route: { originalPath: '/auth/:token' } },
    );

    expect($window.history.back).not.toHaveBeenCalled();
    expect($location.path).toHaveBeenCalledWith('/');
  });
});
