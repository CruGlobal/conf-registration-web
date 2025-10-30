import 'angular-mocks';

describe('Service: GlobalPromotionService', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let globalPromotionService, $httpBackend, $rootScope, modalMessage, testData;

  beforeEach(inject((
    _globalPromotionService_,
    _$httpBackend_,
    _$rootScope_,
    _modalMessage_,
    _testData_,
  ) => {
    globalPromotionService = _globalPromotionService_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    modalMessage = _modalMessage_;
    testData = _testData_;
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('loadPromotions', () => {
    it('should load promotions and cache them', () => {
      $httpBackend
        .expectGET('globalPromotions?ministryId=ministry-1')
        .respond(200, testData.globalPromotions);

      let result;
      globalPromotionService.loadPromotions('ministry-1').then((promotions) => {
        result = promotions;
      });

      $httpBackend.flush();

      expect(result).toEqual(testData.globalPromotions);
      expect($rootScope.loadingMsg).toBe('');
    });

    it('should include ministryActivityId in params when provided', () => {
      $httpBackend
        .expectGET(
          'globalPromotions?ministryId=ministry-1&ministryActivityId=activity-1',
        )
        .respond(200, testData.globalPromotions);

      globalPromotionService.loadPromotions('ministry-1', 'activity-1');

      $httpBackend.flush();
    });

    it('should use cached data on subsequent calls', () => {
      $httpBackend
        .expectGET('globalPromotions?ministryId=ministry-1')
        .respond(200, testData.globalPromotions);

      let resultOne;
      globalPromotionService.loadPromotions('ministry-1').then((promos) => {
        resultOne = promos;
      });

      $httpBackend.flush();

      // Second call should use cache (no HTTP request)
      let resultTwo;
      globalPromotionService.loadPromotions('ministry-1').then((promos) => {
        resultTwo = promos;
      });

      $rootScope.$digest();

      expect(resultOne).toEqual(testData.globalPromotions);
      expect(resultTwo).toEqual(testData.globalPromotions);
    });

    it('should set loadingMsg while loading', () => {
      $httpBackend
        .expectGET('globalPromotions?ministryId=ministry-1')
        .respond(200, testData.globalPromotions);

      globalPromotionService.loadPromotions('ministry-1');

      expect($rootScope.loadingMsg).toBe('Loading Promotions');

      $httpBackend.flush();

      expect($rootScope.loadingMsg).toBe('');
    });

    it('should cache different ministry/activity combinations separately', () => {
      const ministryOnePromotions = [testData.globalPromotions[0]];
      const ministryTwoPromotions = [testData.globalPromotions[1]];

      $httpBackend
        .expectGET('globalPromotions?ministryId=ministry-1')
        .respond(200, ministryOnePromotions);
      $httpBackend
        .expectGET('globalPromotions?ministryId=ministry-2')
        .respond(200, ministryTwoPromotions);

      let resultOne, resultTwo;
      globalPromotionService.loadPromotions('ministry-1').then((promotions) => {
        resultOne = promotions;
      });
      globalPromotionService.loadPromotions('ministry-2').then((promotions) => {
        resultTwo = promotions;
      });

      $httpBackend.flush();

      expect(resultOne).toEqual(ministryOnePromotions);
      expect(resultTwo).toEqual(ministryTwoPromotions);
    });
  });

  describe('hasGlobalPromotionsInCache', () => {
    let ministry, ministryId, ministryActivityId;

    beforeEach(() => {
      ministry = testData.ministries[0];
      ministryId = ministry.id;
      ministryActivityId = ministry.activities[0].id;
    });

    it('should return true when promotions exist in cache', () => {
      $httpBackend
        .expectGET(
          `globalPromotions?ministryId=${ministryId}&ministryActivityId=${ministryActivityId}`,
        )
        .respond(200, testData.globalPromotions);

      globalPromotionService.loadPromotions(ministryId, ministryActivityId);
      $httpBackend.flush();

      const result = globalPromotionService.hasGlobalPromotionsInCache(
        ministryId,
        ministryActivityId,
      );

      expect(result).toBe(true);
    });

    it('should return false when no promotions exist in cache', () => {
      const result = globalPromotionService.hasGlobalPromotionsInCache(
        'ministry-nonexistent',
        'activity-nonexistent',
      );

      expect(result).toBe(false);
    });

    it('should return false when cached data is empty array', () => {
      $httpBackend
        .expectGET('globalPromotions?ministryId=ministry-1')
        .respond(200, []);

      globalPromotionService.loadPromotions('ministry-1');
      $httpBackend.flush();

      const result = globalPromotionService.hasGlobalPromotionsInCache(
        'ministry-1',
        undefined,
      );

      expect(result).toBe(false);
    });
  });

  describe('hasPromotionsForConference', () => {
    let ministry, ministryId, ministryActivityId;

    beforeEach(() => {
      ministry = testData.ministries[0];
      ministryId = ministry.id;
      ministryActivityId = ministry.activities[0].id;
    });

    it('should return true when conference has eligible registrant types, ministry info, and cached promotions', () => {
      $httpBackend
        .expectGET(
          `globalPromotions?ministryId=${ministryId}&ministryActivityId=${ministryActivityId}`,
        )
        .respond(200, testData.globalPromotions);

      globalPromotionService.loadPromotions(ministryId, ministryActivityId);
      $httpBackend.flush();

      const conferenceWithMinistryActivity = {
        ...testData.conference,
        ministry: ministryId,
        ministryActivity: ministryActivityId,
      };

      expect(
        globalPromotionService.hasPromotionsForConference(
          conferenceWithMinistryActivity,
        ),
      ).toBe(true);
    });

    it('should return false when no registrant types are eligible for global promotions', () => {
      const conferenceWithNoEligibleTypes = {
        ...testData.conference,
        registrantTypes: [
          {
            ...testData.conference.registrantTypes[0],
            eligibleForGlobalPromotions: false,
          },
        ],
      };

      $httpBackend
        .expectGET(
          `globalPromotions?ministryId=${ministryId}&ministryActivityId=${ministryActivityId}`,
        )
        .respond(200, testData.globalPromotions);

      globalPromotionService.loadPromotions(ministryId, ministryActivityId);
      $httpBackend.flush();

      const result = globalPromotionService.hasPromotionsForConference(
        conferenceWithNoEligibleTypes,
      );

      expect(result).toBe(false);
    });

    it('should return false when conference has no ministry', () => {
      const conferenceWithoutMinistry = {
        ...testData.conference,
        ministry: null,
      };

      const result = globalPromotionService.hasPromotionsForConference(
        conferenceWithoutMinistry,
      );

      expect(result).toBe(false);
    });

    it('should return false when conference has no ministryActivity', () => {
      const conferenceWithoutActivity = {
        ...testData.conference,
        ministryActivity: null,
      };

      const result = globalPromotionService.hasPromotionsForConference(
        conferenceWithoutActivity,
      );

      expect(result).toBe(false);
    });

    it('should return false when no cached promotions exist even with eligible registrant types', () => {
      $httpBackend
        .expectGET(
          `globalPromotions?ministryId=${ministryId}&ministryActivityId=${ministryActivityId}`,
        )
        .respond(200, []);

      globalPromotionService.loadPromotions(ministryId, ministryActivityId);
      $httpBackend.flush();

      const result = globalPromotionService.hasPromotionsForConference(
        testData.conference,
      );

      expect(result).toBe(false);
    });
  });

  describe('createPromotion', () => {
    it('should create a promotion and add it to the cache', () => {
      // First load promotions to populate the cache
      $httpBackend
        .expectGET('globalPromotions?ministryId=ministry-1')
        .respond(200, testData.globalPromotions);

      globalPromotionService.loadPromotions('ministry-1');
      $httpBackend.flush();

      // Create a new promotion
      const newPromo = {
        code: 'NEWCODE',
        amount: 75,
        type: 'FIXED',
        ministryId: 'ministry-1',
      };

      const createdPromo = { ...newPromo, id: 'promo-new' };

      $httpBackend
        .expectPOST('globalPromotions', newPromo)
        .respond(201, createdPromo);

      let result;
      globalPromotionService.createPromotion(newPromo).then((promo) => {
        result = promo;
      });

      $httpBackend.flush();

      expect(result).toEqual(createdPromo);
      expect($rootScope.loadingMsg).toBe('');

      // Verify the cache was updated (no new HTTP request)
      let cachedPromos;
      globalPromotionService.loadPromotions('ministry-1').then((promos) => {
        cachedPromos = promos;
      });

      $rootScope.$digest();

      // Should include the new promotion
      expect(cachedPromos).toContain(createdPromo);
    });

    it('should set loadingMsg while creating', () => {
      const newPromo = { code: 'NEWCODE', amount: 75 };

      $httpBackend
        .expectPOST('globalPromotions')
        .respond(201, { ...newPromo, id: 'promo-new' });

      globalPromotionService.createPromotion(newPromo);

      expect($rootScope.loadingMsg).toBe('Creating Promotion');

      $httpBackend.flush();

      expect($rootScope.loadingMsg).toBe('');
    });

    it('should show error modal on failure', () => {
      spyOn(modalMessage, 'error');

      const newPromo = { code: 'NEWCODE', amount: 75 };
      const errorResponse = {
        error: { message: 'Promotion code already exists' },
      };

      $httpBackend.expectPOST('globalPromotions').respond(400, errorResponse);

      globalPromotionService.createPromotion(newPromo);
      $httpBackend.flush();

      expect(modalMessage.error).toHaveBeenCalledWith({
        title: 'Error Creating Promotion',
        message: errorResponse.error,
      });

      expect($rootScope.loadingMsg).toBe('');
    });
  });

  describe('updatePromotion', () => {
    it('should update a promotion and replace it in the cache', () => {
      // First load promotions to populate the cache
      const ministryId = testData.globalPromotions[0].ministryId;
      const ministryOnePromos = [testData.globalPromotions[0]];

      $httpBackend
        .expectGET(`globalPromotions?ministryId=${ministryId}`)
        .respond(200, ministryOnePromos);

      globalPromotionService.loadPromotions(ministryId);
      $httpBackend.flush();

      // Update an existing promotion (remove ministryActivityId to match cache key)
      const updatedPromo = {
        ...ministryOnePromos[0],
        ministryActivityId: undefined, // Remove to match cache key 'ministry-1:all'
        code: 'UPDATEDCODE',
        amount: 100,
      };

      $httpBackend
        .expectPUT('globalPromotions', updatedPromo)
        .respond(200, updatedPromo);

      let result;
      globalPromotionService.updatePromotion(updatedPromo).then((promo) => {
        result = promo;
      });

      $httpBackend.flush();

      expect(result).toEqual(updatedPromo);
      expect($rootScope.loadingMsg).toBe('');

      // Verify the cache was updated (no new HTTP request)
      let cachedPromos;
      globalPromotionService.loadPromotions(ministryId).then((promos) => {
        cachedPromos = promos;
      });

      $rootScope.$digest();

      // Should include the updated promotion
      const cachedPromo = cachedPromos.find(
        (promotion) => promotion.id === updatedPromo.id,
      );

      expect(cachedPromo).toEqual(updatedPromo);

      expect(cachedPromo.code).toBe('UPDATEDCODE');
    });

    it('should set loadingMsg while updating', () => {
      const updatedPromo = { id: 'promo-1', code: 'UPDATEDCODE', amount: 100 };

      $httpBackend
        .expectPUT('globalPromotions', updatedPromo)
        .respond(200, updatedPromo);

      globalPromotionService.updatePromotion(updatedPromo);

      expect($rootScope.loadingMsg).toBe('Updating Promotion');

      $httpBackend.flush();

      expect($rootScope.loadingMsg).toBe('');
    });

    it('should show error modal on failure', () => {
      spyOn(modalMessage, 'error');

      const updatedPromo = { id: 'promo-1', code: 'UPDATEDCODE', amount: 100 };
      const errorResponse = { error: { message: 'Not found' } };

      $httpBackend
        .expectPUT('globalPromotions', updatedPromo)
        .respond(404, errorResponse);

      globalPromotionService.updatePromotion(updatedPromo);

      $httpBackend.flush();

      expect(modalMessage.error).toHaveBeenCalledWith({
        title: 'Error Updating Promotion',
        message: errorResponse.error,
      });

      expect($rootScope.loadingMsg).toBe('');
    });
  });
});
