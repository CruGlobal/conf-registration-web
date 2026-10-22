import 'angular-mocks';

describe('Route: /auth/:token', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let $injector,
    $location,
    $rootScope,
    $q,
    $cookies,
    ProfileCache,
    staffLoginWarning,
    signIn;

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
    staffLoginWarning = $injector.get('staffLoginWarning');
    spyOn(staffLoginWarning, 'show');
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

    expect(staffLoginWarning.show).toHaveBeenCalledWith('GOOGLE');

    expect($location.search().staffLoginWarning).toBeUndefined();
    expect($location.path()).toBe('/');
  });

  it('does not warn when the API did not flag the login', () => {
    spyOn(ProfileCache, 'getCache').and.returnValue(
      $q.resolve({ authProviderType: 'GOOGLE' }),
    );

    runSignIn({});

    expect(staffLoginWarning.show).not.toHaveBeenCalled();
    expect($location.path()).toBe('/');
  });
});

describe('Route: /logout', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  afterEach(inject(($cookies) => {
    $cookies.remove('crsToken');
    $cookies.remove('crsAuthProviderType');
  }));

  it('clears the session and logs out of the provider', inject((
    $injector,
    $route,
    $q,
    $cookies,
    $httpBackend,
    MinistriesCache,
    ProfileCache,
    logoutService,
  ) => {
    // MinistryAdminsCache reloads when the auth token changes
    spyOn(MinistriesCache, 'get').and.returnValue($q.resolve([]));
    $httpBackend.whenGET('ministries/admin').respond(200, []);
    $httpBackend.whenGET('auth/logout').respond(200, {});
    $cookies.put('crsToken', 'token-123');
    $cookies.put('crsAuthProviderType', 'GOOGLE');
    spyOn(ProfileCache, 'clearCache');
    spyOn(logoutService, 'logoutFormProviders');

    let redirect;
    $injector
      .invoke($route.routes['/logout'].resolveRedirectTo)
      .then((path) => {
        redirect = path;
      });
    $httpBackend.flush();

    expect($cookies.get('crsToken')).toBeUndefined();
    expect($cookies.get('crsAuthProviderType')).toBeUndefined();
    expect(ProfileCache.clearCache).toHaveBeenCalledWith();
    expect(logoutService.logoutFormProviders).toHaveBeenCalledWith(
      jasmine.objectContaining({ data: {} }),
    );

    expect(redirect).toBe('/');
  }));
});
