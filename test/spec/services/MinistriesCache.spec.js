import 'angular-mocks';

describe('Service: MinistriesCache', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let MinistriesCache, $httpBackend, $rootScope, ministries;
  beforeEach(inject((
    _MinistriesCache_,
    _$httpBackend_,
    _$rootScope_,
    testData,
  ) => {
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    MinistriesCache = _MinistriesCache_;
    ministries = testData.ministries;

    $httpBackend.expectGET('ministries').respond(200, ministries);
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('get', () => {
    it('should fetch and sort data', () => {
      let loadedMinistries;
      MinistriesCache.get().then((result) => {
        loadedMinistries = result;
      }, fail);

      $httpBackend.flush();
      $rootScope.$apply();

      expect(loadedMinistries.map(({ name }) => name)).toEqual([
        'Athletes in Action',
        'Campus - National Team/Strategy',
        'Family Life',
        'Lifelines',
      ]);

      expect(loadedMinistries[3].activities.map(({ name }) => name)).toEqual([
        'Canoeing/Kayaking',
        'General',
        'Paintball',
        'Rock Climbing',
        'White Water Rafting',
      ]);

      expect(loadedMinistries[1].strategies.map(({ name }) => name)).toEqual([
        'Bridges',
        'N/A',
      ]);

      expect(loadedMinistries[1].eventTypes.map(({ name }) => name)).toEqual([
        'Fall Retreat/Getaway',
        'Mobilization/Recruiting',
      ]);
    });

    it('should use cached data on subsequent calls', () => {
      MinistriesCache.get().catch(fail);
      $httpBackend.flush();
      MinistriesCache.get().catch(fail);

      // afterEach asserts that there are no outstanding HTTP requests
    });

    it('should handle HTTP errors', () => {
      $httpBackend.resetExpectations();
      $httpBackend.expectGET('ministries').respond(500, 'Server Error');

      let errorCaught = false;
      MinistriesCache.get().then(fail, () => {
        errorCaught = true;
      });

      $httpBackend.flush();

      expect(errorCaught).toBe(true);
    });
  });

  describe('with loaded ministries', () => {
    beforeEach(() => {
      MinistriesCache.get().catch(fail);
      $httpBackend.flush();
      $rootScope.$apply();
    });

    describe('getMinistryName', () => {
      it('should return ministry name', () => {
        expect(MinistriesCache.getMinistryName(ministries[0].id)).toBe(
          ministries[0].name,
        );
      });

      it('should return null for non-existent ministry', () => {
        expect(MinistriesCache.getMinistryName('non-existent-id')).toBe(null);
      });
    });

    describe('getActivityName', () => {
      it('should return activity name', () => {
        const activity = ministries[0].activities[0];

        expect(
          MinistriesCache.getActivityName(ministries[0].id, activity.id),
        ).toBe(activity.name);
      });

      it('should return null for non-existent ministry', () => {
        const name = MinistriesCache.getActivityName(
          'non-existent-id',
          'some-activity-id',
        );

        expect(name).toBe(null);
      });

      it('should return null for non-existent activity', () => {
        const name = MinistriesCache.getActivityName(
          ministries[1].id,
          'non-existent-activity-id',
        );

        expect(name).toBe(null);
      });
    });
  });
});
