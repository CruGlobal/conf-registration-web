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

describe('app_enforceAuth auth_error', () => {
  let $rootScope, loginDialog;
  let crsToken;

  beforeEach(
    angular.mock.module('confRegistrationWebApp', ($provide) => {
      $provide.value('$cookies', {
        get: (key) => (key === 'crsToken' ? crsToken : undefined),
        put: angular.noop,
        remove: angular.noop,
      });
    }),
  );

  beforeEach(inject((_$rootScope_, _loginDialog_) => {
    $rootScope = _$rootScope_;
    loginDialog = _loginDialog_;
    spyOn(loginDialog, 'show');
  }));

  const routeChangeStart = (authError) =>
    $rootScope.$broadcast('$routeChangeStart', {
      params: { auth_error: authError },
    });

  it('prompts to sign in again after a stale callback when signed out', () => {
    crsToken = undefined;
    routeChangeStart('staleAuthentication');

    expect(loginDialog.show).toHaveBeenCalledWith({
      authError: 'Your sign in could not be completed. Please try again.',
    });
  });

  it('does not prompt after a stale callback when already signed in', () => {
    crsToken = 'token';
    routeChangeStart('staleAuthentication');

    expect(loginDialog.show).not.toHaveBeenCalled();
  });

  it('still prompts for other auth errors when signed in', () => {
    crsToken = 'token';
    routeChangeStart('expiredAuthentication');

    expect(loginDialog.show).toHaveBeenCalledWith({
      authError: 'Your sign in attempt took too long. Please try again.',
    });
  });
});
