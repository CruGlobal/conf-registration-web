import 'angular-mocks';
import { Rollbar } from 'scripts/errorNotify.js';

describe('Service: ProfileCache', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let ProfileCache, $cookies, $httpBackend, $rootScope;
  const profile = {
    id: 'profile-id',
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@cru.org',
  };

  beforeEach(inject((
    _$cookies_,
    _$httpBackend_,
    _$rootScope_,
    $q,
    _ProfileCache_,
    MinistriesCache,
  ) => {
    $cookies = _$cookies_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    ProfileCache = _ProfileCache_;

    // MinistryAdminsCache reloads when the auth token changes
    spyOn(MinistriesCache, 'get').and.returnValue($q.resolve([]));
    $httpBackend.whenGET('ministries/admin').respond(200, []);

    spyOn(Rollbar, 'configure');
  }));

  afterEach(() => {
    $cookies.remove('crsToken');

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('when logged in', () => {
    beforeEach(() => {
      $cookies.put('crsToken', 'authToken');
    });

    it('should load the profile and set the Rollbar person', () => {
      $httpBackend.expectGET('profile').respond(200, profile);

      let loadedProfile;
      ProfileCache.getCache().then((result) => {
        loadedProfile = result;
      }, fail);
      $httpBackend.flush();

      expect(loadedProfile).toEqual(profile);
      expect(Rollbar.configure).toHaveBeenCalledWith({
        payload: {
          person: {
            id: 'profile-id',
            username: 'Test User',
            email: 'test.user@cru.org',
          },
        },
      });
    });

    it('should clear the Rollbar person when the cache is cleared', () => {
      ProfileCache.clearCache();

      expect(Rollbar.configure).toHaveBeenCalledWith({
        payload: {
          person: {},
        },
      });
    });
  });

  describe('when not logged in', () => {
    it('should not load the profile or set the Rollbar person', () => {
      ProfileCache.getCache().catch(angular.noop);
      $rootScope.$digest();

      expect(Rollbar.configure).not.toHaveBeenCalled();
    });
  });
});
