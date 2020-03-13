import 'angular-mocks';

describe('Service: logoutService', () => {
  let logoutService, $rootScope, $window, $sce;
  let cookieValue = null;

  beforeEach(
    angular.mock.module('confRegistrationWebApp', $provide => {
      $provide.value('$window', { location: { href: 'dummy' } });
      $provide.value('$cookies', {
        get: () => {
          return cookieValue;
        },
      });
    }),
  );

  beforeEach(inject((_logoutService_, _$rootScope_, _$sce_, _$window_) => {
    $rootScope = _$rootScope_;
    $sce = _$sce_;
    $window = _$window_;
    logoutService = _logoutService_;
  }));

  it('should logout from facebook', () => {
    cookieValue = 'FACEBOOK';
    logoutService.logoutFormProviders({
      data: { facebookUrl: 'redirect url' },
    });

    expect($window.location.href).toEqual('redirect url');
  });

  it('should logout from instagram', () => {
    cookieValue = 'INSTAGRAM';
    logoutService.logoutFormProviders();

    expect($sce.getTrustedHtml($rootScope.logoutElement)).toEqual(
      '<iframe class="logout-element" src="https://instagram.com/accounts/logout/" width="0" height="0" ' +
        "onload=\"document.querySelector('.logout-element').parentNode.removeChild(document.querySelector('.logout-element'));\"/>",
    );
  });

  it('should logout from relay', () => {
    cookieValue = 'RELAY';
    logoutService.logoutFormProviders();

    expect($window.location.href).toContain(
      'https://signon.cru.org/cas/logout?service=',
    );
  });
});
