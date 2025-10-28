import 'angular-mocks';

describe('Service: MinistryAdminsCache', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let MinistryAdminsCache, $cookies, $httpBackend, $rootScope, mockMinistries;
  beforeEach(inject((
    _$cookies_,
    _$httpBackend_,
    _$rootScope_,
    _MinistryAdminsCache_,
    testData,
  ) => {
    $cookies = _$cookies_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    MinistryAdminsCache = _MinistryAdminsCache_;
    mockMinistries = testData.ministries.map(({ id, name }) => ({ id, name }));
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

    it('it should load ministry admins', () => {
      $httpBackend.expectGET('ministries/admin').respond(200, mockMinistries);

      $httpBackend.flush();

      expect(MinistryAdminsCache.getSync()).toEqual(
        mockMinistries.map((ministry) => ministry.id),
      );
    });

    describe('getAsync', () => {
      it('should return with ministry ids', () => {
        $httpBackend.expectGET('ministries/admin').respond(200, mockMinistries);

        $rootScope.$digest();
        $httpBackend.flush();

        let ministryIds;
        MinistryAdminsCache.getAsync().then((result) => {
          ministryIds = result;
        }, fail);
        $rootScope.$digest();

        expect(ministryIds).toEqual(
          mockMinistries.map((ministry) => ministry.id),
        );
      });

      it('should use cached data on subsequent calls', () => {
        $httpBackend.expectGET('ministries/admin').respond(200, mockMinistries);

        $rootScope.$digest();
        $httpBackend.flush();

        let ministryIds;
        MinistryAdminsCache.getAsync().then((result) => {
          ministryIds = result;
        }, fail);
        $rootScope.$digest();

        expect(ministryIds.length).toBe(mockMinistries.length);

        let ministryIds2;
        MinistryAdminsCache.getAsync().then((result) => {
          ministryIds2 = result;
        }, fail);
        $rootScope.$digest();

        expect(ministryIds2).toEqual(ministryIds);
      });

      it('should not cache error response', () => {
        $httpBackend.expectGET('ministries/admin').respond(500);

        $rootScope.$digest();
        $httpBackend.flush();

        $httpBackend.expectGET('ministries/admin').respond(500);

        let ministryIds;
        MinistryAdminsCache.getAsync().then((result) => {
          ministryIds = result;
        }, fail);
        $httpBackend.flush();

        expect(ministryIds).toEqual([]);
      });
    });
  });

  describe('when not logged in', () => {
    it('it should not load ministry admins', () => {
      $rootScope.$digest();

      expect(MinistryAdminsCache.getSync()).toEqual([]);
    });

    it('getAsync resolves with empty array', () => {
      $rootScope.$digest();

      let ministryIds;
      MinistryAdminsCache.getAsync().then((result) => {
        ministryIds = result;
      }, fail);
      $rootScope.$digest();

      expect(ministryIds).toEqual([]);
    });
  });

  describe('when token changes', () => {
    it('should reload cache when auth token changes', () => {
      $cookies.put('crsToken', 'authToken');
      $httpBackend.expectGET('ministries/admin').respond(200, mockMinistries);

      $rootScope.$digest();
      $httpBackend.flush();

      expect(MinistryAdminsCache.getSync()).toEqual(
        mockMinistries.map((ministry) => ministry.id),
      );

      $cookies.put('crsToken', 'authToken2');
      $httpBackend
        .expectGET('ministries/admin')
        .respond(200, mockMinistries.slice(0, 1));
      $httpBackend.flush();
      $rootScope.$digest();

      expect(MinistryAdminsCache.getSync()).toEqual([mockMinistries[0].id]);
    });
  });
});
