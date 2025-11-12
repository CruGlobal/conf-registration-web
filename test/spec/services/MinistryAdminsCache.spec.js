import 'angular-mocks';

describe('Service: MinistryAdminsCache', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let MinistryAdminsCache,
    $cookies,
    $httpBackend,
    $rootScope,
    mockMinistries,
    expectedMinistries;
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
    const permissionLevels = ['VIEW', 'UPDATE', 'FULL'];
    mockMinistries = testData.ministries.map(({ id, name }, index) => ({
      ministry: { id, name },
      permissionLevel: permissionLevels[index % permissionLevels.length],
    }));
    expectedMinistries = [
      { id: mockMinistries[0].ministry.id, readonly: true },
      { id: mockMinistries[1].ministry.id, readonly: false },
      { id: mockMinistries[2].ministry.id, readonly: false },
    ];
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

      expect(MinistryAdminsCache.getSync()).toEqual(expectedMinistries);
    });

    describe('getAsync', () => {
      it('should return with ministry ids', () => {
        $httpBackend.expectGET('ministries/admin').respond(200, mockMinistries);

        $rootScope.$digest();
        $httpBackend.flush();

        let ministries;
        MinistryAdminsCache.getAsync().then((result) => {
          ministries = result;
        }, fail);
        $rootScope.$digest();

        expect(ministries).toEqual(expectedMinistries);
      });

      it('should use cached data on subsequent calls', () => {
        $httpBackend.expectGET('ministries/admin').respond(200, mockMinistries);

        $rootScope.$digest();
        $httpBackend.flush();

        let ministries;
        MinistryAdminsCache.getAsync().then((result) => {
          ministries = result;
        }, fail);
        $rootScope.$digest();

        expect(ministries).toEqual(expectedMinistries);

        let ministries2;
        MinistryAdminsCache.getAsync().then((result) => {
          ministries2 = result;
        }, fail);
        $rootScope.$digest();

        expect(ministries2).toEqual(expectedMinistries);
      });

      it('should not cache error response', () => {
        $httpBackend.expectGET('ministries/admin').respond(500);

        $rootScope.$digest();
        $httpBackend.flush();

        $httpBackend.expectGET('ministries/admin').respond(500);

        let ministries;
        MinistryAdminsCache.getAsync().then((result) => {
          ministries = result;
        }, fail);
        $httpBackend.flush();

        expect(ministries).toEqual([]);
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

      let ministries;
      MinistryAdminsCache.getAsync().then((result) => {
        ministries = result;
      }, fail);
      $rootScope.$digest();

      expect(ministries).toEqual([]);
    });
  });

  describe('when token changes', () => {
    it('should reload cache when auth token changes', () => {
      $cookies.put('crsToken', 'authToken');
      $httpBackend.expectGET('ministries/admin').respond(200, mockMinistries);

      $rootScope.$digest();
      $httpBackend.flush();

      expect(MinistryAdminsCache.getSync()).toEqual(expectedMinistries);

      $cookies.put('crsToken', 'authToken2');
      $httpBackend
        .expectGET('ministries/admin')
        .respond(200, mockMinistries.slice(0, 1));
      $httpBackend.flush();
      $rootScope.$digest();

      expect(MinistryAdminsCache.getSync()).toEqual([expectedMinistries[0]]);
    });
  });
});
