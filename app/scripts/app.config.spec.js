import 'angular-mocks';

describe('Route: /auth/:token', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let $injector, $location, $rootScope, $q, $cookies, ProfileCache, signIn;

  beforeEach(inject((
    _$injector_,
    _$location_,
    _$rootScope_,
    _$q_,
    _$cookies_,
    $route,
    $httpBackend,
    MinistriesCache,
  ) => {
    $injector = _$injector_;
    $location = _$location_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    $cookies = _$cookies_;
    ProfileCache = $injector.get('ProfileCache');
    signIn = $route.routes['/auth/:token'].resolve.redirectToIntendedRoute;

    // MinistryAdminsCache reloads when the auth token changes
    spyOn(MinistriesCache, 'get').and.returnValue($q.resolve([]));
    $httpBackend.whenGET('ministries/admin').respond(200, []);
  }));

  afterEach(() => {
    $cookies.remove('crsToken');
    $cookies.remove('crsAuthProviderType');
  });

  const runSignIn = (params) => {
    $location.path('/auth/token-123').search(params);
    $injector.invoke(signIn, null, {
      $route: { current: { params: { token: 'token-123', ...params } } },
    });
    $rootScope.$digest();
  };

  it('warns staff flagged by the API about their login provider', () => {
    spyOn(ProfileCache, 'getCache').and.returnValue(
      $q.resolve({ authProviderType: 'GOOGLE' }),
    );

    runSignIn({ staffLoginWarning: 'true' });

    expect($rootScope.staffLoginWarning).toContain(
      'You have logged in with Google.',
    );

    expect($location.search().staffLoginWarning).toBeUndefined();
    expect($location.path()).toBe('/');
  });

  it('does not warn when the API did not flag the login', () => {
    spyOn(ProfileCache, 'getCache').and.returnValue(
      $q.resolve({ authProviderType: 'GOOGLE' }),
    );

    runSignIn({});

    expect($rootScope.staffLoginWarning).toBeFalsy();
    expect($location.path()).toBe('/');
  });
});

describe('Route: /logout', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  it('clears the staff login warning', inject((
    $injector,
    $route,
    $rootScope,
    $httpBackend,
  ) => {
    $httpBackend.whenGET('auth/logout').respond(200, {});
    $rootScope.staffLoginWarning = 'You have logged in with Google.';

    $injector.invoke($route.routes['/logout'].resolveRedirectTo);
    $httpBackend.flush();

    expect($rootScope.staffLoginWarning).toBe('');
  }));
});
