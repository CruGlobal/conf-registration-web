import 'angular-mocks';

describe('Service: logoutService', function() {
  let logoutService, $rootScope, $window, $sce;
  let cookieValue = null;

  beforeEach(
    angular.mock.module('confRegistrationWebApp', function($provide) {
      $provide.value('$window', { location: { href: 'dummy' } });
      $provide.value('$cookies', {
        get: function() {
          return cookieValue;
        },
      });
    }),
  );

  beforeEach(inject(function(_logoutService_, _$rootScope_, _$sce_, _$window_) {
    $rootScope = _$rootScope_;
    $sce = _$sce_;
    $window = _$window_;
    logoutService = _logoutService_;
  }));

  it('should logout from facebook', function() {
    cookieValue = 'FACEBOOK';
    logoutService.logoutFormProviders({ data: { url: 'redirect url' } });
    expect($window.location.href).toEqual('redirect url');
  });

  it('should logout from instagram', function() {
    cookieValue = 'INSTAGRAM';
    logoutService.logoutFormProviders();
    expect($sce.getTrustedHtml($rootScope.logoutElement)).toEqual(
      '<iframe class="logout-element" src="https://instagram.com/accounts/logout/" width="0" height="0" ' +
        "onload=\"document.querySelector('.logout-element').parentNode.removeChild(document.querySelector('.logout-element'));\"/>",
    );
  });

  it('should logout from relay', function() {
    cookieValue = 'RELAY';
    logoutService.logoutFormProviders();
    expect($window.location.href).toContain(
      'https://signon.cru.org/cas/logout?service=',
    );
  });
});
