import 'angular-mocks';

describe('Service: logoutService', () => {
  let logoutService, $window;
  let cookieValue = null;

  beforeEach(
    angular.mock.module('confRegistrationWebApp', ($provide) => {
      $provide.value('$window', { location: { href: 'dummy' } });
      $provide.value('$cookies', {
        get: () => {
          return cookieValue;
        },
      });
    }),
  );

  beforeEach(inject((_logoutService_, _$window_) => {
    $window = _$window_;
    logoutService = _logoutService_;
  }));

  it('should logout from google', () => {
    cookieValue = 'GOOGLE';
    logoutService.logoutFormProviders({
      data: { googleUrl: 'redirect url' },
    });

    expect($window.location.href).toEqual('redirect url');
  });

  it('should logout from facebook', () => {
    cookieValue = 'FACEBOOK';
    logoutService.logoutFormProviders({
      data: { facebookUrl: 'redirect url' },
    });

    expect($window.location.href).toEqual('redirect url');
  });

  it('should logout from relay', () => {
    cookieValue = 'RELAY';
    logoutService.logoutFormProviders({
      data: { oktaUrl: 'redirect url' },
    });

    expect($window.location.href).toEqual('redirect url');
  });
});
