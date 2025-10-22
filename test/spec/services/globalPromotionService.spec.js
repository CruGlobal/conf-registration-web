import 'angular-mocks';

describe('Service: GlobalPromotionService', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let globalPromotionService, $httpBackend, $rootScope, modalMessage, testData;

  const mockUrl = 'http://localhost:9001';

  beforeEach(inject(function (
    _globalPromotionService_,
    _$httpBackend_,
    _$rootScope_,
    _modalMessage_,
    _testData_,
  ) {
    globalPromotionService = _globalPromotionService_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    modalMessage = _modalMessage_;
    testData = _testData_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('loadPromotions', function () {
    it('should load promotions and cache them', function () {
      $httpBackend
        .expectGET(`${mockUrl}/globalPromotions?ministryId=ministry-1`)
        .respond(200, testData.globalPromotions);

      let result;
      globalPromotionService
        .loadPromotions('ministry-1')
        .then(function (promotions) {
          result = promotions;
        });

      $httpBackend.flush();

      expect(result).toEqual(testData.globalPromotions);
      expect($rootScope.loadingMsg).toBe('');
    });

    it('should include ministryActivityId in params when provided', function () {
      $httpBackend
        .expectGET(
          `${mockUrl}/globalPromotions?ministryId=ministry-1&ministryActivityId=activity-1`,
        )
        .respond(200, testData.globalPromotions);

      globalPromotionService.loadPromotions('ministry-1', 'activity-1');

      $httpBackend.flush();
    });

    it('should use cached data on subsequent calls', function () {
      $httpBackend
        .expectGET(`${mockUrl}/globalPromotions?ministryId=ministry-1`)
        .respond(200, testData.globalPromotions);

      let resultOne;
      globalPromotionService
        .loadPromotions('ministry-1')
        .then(function (promos) {
          resultOne = promos;
        });

      $httpBackend.flush();

      // Second call should use cache (no HTTP request)
      let resultTwo;
      globalPromotionService
        .loadPromotions('ministry-1')
        .then(function (promos) {
          resultTwo = promos;
        });

      $rootScope.$digest();

      expect(resultOne).toEqual(testData.globalPromotions);
      expect(resultTwo).toEqual(testData.globalPromotions);
    });

    it('should set loadingMsg while loading', function () {
      $httpBackend
        .expectGET(`${mockUrl}/globalPromotions?ministryId=ministry-1`)
        .respond(200, testData.globalPromotions);

      globalPromotionService.loadPromotions('ministry-1');

      expect($rootScope.loadingMsg).toBe('Loading Promotions');

      $httpBackend.flush();

      expect($rootScope.loadingMsg).toBe('');
    });

    it('should cache different ministry/activity combinations separately', function () {
      const ministryOnePromotions = [testData.globalPromotions[0]];
      const ministryTwoPromotions = [testData.globalPromotions[1]];

      $httpBackend
        .expectGET(`${mockUrl}/globalPromotions?ministryId=ministry-1`)
        .respond(200, ministryOnePromotions);
      $httpBackend
        .expectGET(`${mockUrl}/globalPromotions?ministryId=ministry-2`)
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

  describe('hasPromotionsForConference', function () {
    it('should return true when promotions exist in cache', function () {
      $httpBackend
        .expectGET(
          `${mockUrl}/globalPromotions?ministryId=ministry-1&ministryActivityId=activity-1`,
        )
        .respond(200, testData.globalPromotions);

      globalPromotionService.loadPromotions('ministry-1', 'activity-1');
      $httpBackend.flush();

      const result = globalPromotionService.hasPromotionsForConference(
        'ministry-1',
        'activity-1',
      );

      expect(result).toBe(true);
    });

    it('should return false when no promotions exist in cache', function () {
      const result = globalPromotionService.hasPromotionsForConference(
        'ministry-nonexistent',
        'activity-nonexistent',
      );

      expect(result).toBe(false);
    });

    it('should return false when cached data is empty array', function () {
      $httpBackend
        .expectGET(`${mockUrl}/globalPromotions?ministryId=ministry-1`)
        .respond(200, []);

      globalPromotionService.loadPromotions('ministry-1');
      $httpBackend.flush();

      const result = globalPromotionService.hasPromotionsForConference(
        'ministry-1',
        undefined,
      );

      expect(result).toBe(false);
    });
  });

  describe('createPromotion', function () {
    it('should create a promotion and add it to the cache', function () {
      // First load promotions to populate the cache
      $httpBackend
        .expectGET(`${mockUrl}/globalPromotions?ministryId=ministry-1`)
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
        .expectPOST(`${mockUrl}/globalPromotions`, newPromo)
        .respond(201, createdPromo);

      let result;
      globalPromotionService.createPromotion(newPromo).then(function (promo) {
        result = promo;
      });

      $httpBackend.flush();

      expect(result).toEqual(createdPromo);
      expect($rootScope.loadingMsg).toBe('');

      // Verify the cache was updated (no new HTTP request)
      let cachedPromos;
      globalPromotionService
        .loadPromotions('ministry-1')
        .then(function (promos) {
          cachedPromos = promos;
        });

      $rootScope.$digest();

      // Should include the new promotion
      expect(cachedPromos).toContain(createdPromo);
    });

    it('should set loadingMsg while creating', function () {
      const newPromo = { code: 'NEWCODE', amount: 75 };

      $httpBackend
        .expectPOST(`${mockUrl}/globalPromotions`)
        .respond(201, { ...newPromo, id: 'promo-new' });

      globalPromotionService.createPromotion(newPromo);

      expect($rootScope.loadingMsg).toBe('Creating Promotion');

      $httpBackend.flush();

      expect($rootScope.loadingMsg).toBe('');
    });

    it('should show error modal on failure', function () {
      spyOn(modalMessage, 'error');

      const newPromo = { code: 'NEWCODE', amount: 75 };
      const errorResponse = {
        error: { message: 'Promotion code already exists' },
      };

      $httpBackend
        .expectPOST(`${mockUrl}/globalPromotions`)
        .respond(400, errorResponse);

      globalPromotionService.createPromotion(newPromo);
      $httpBackend.flush();

      expect(modalMessage.error).toHaveBeenCalledWith({
        title: 'Error Creating Promotion',
        message: errorResponse.error,
      });

      expect($rootScope.loadingMsg).toBe('');
    });
  });

  describe('updatePromotion', function () {
    it('should update a promotion and replace it in the cache', function () {
      // First load promotions to populate the cache
      const ministryId = testData.globalPromotions[0].ministryId;
      const ministryOnePromos = [testData.globalPromotions[0]];

      $httpBackend
        .expectGET(`${mockUrl}/globalPromotions?ministryId=${ministryId}`)
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
        .expectPUT(
          `${mockUrl}/globalPromotions/${updatedPromo.id}`,
          updatedPromo,
        )
        .respond(200, updatedPromo);

      let result;
      globalPromotionService
        .updatePromotion(updatedPromo)
        .then(function (promo) {
          result = promo;
        });

      $httpBackend.flush();

      expect(result).toEqual(updatedPromo);
      expect($rootScope.loadingMsg).toBe('');

      // Verify the cache was updated (no new HTTP request)
      let cachedPromos;
      globalPromotionService.loadPromotions(ministryId).then(function (promos) {
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

    it('should set loadingMsg while updating', function () {
      const updatedPromo = { id: 'promo-1', code: 'UPDATEDCODE', amount: 100 };

      $httpBackend
        .expectPUT(`${mockUrl}/globalPromotions/promo-1`)
        .respond(200, updatedPromo);

      globalPromotionService.updatePromotion(updatedPromo);

      expect($rootScope.loadingMsg).toBe('Updating Promotion');

      $httpBackend.flush();

      expect($rootScope.loadingMsg).toBe('');
    });

    it('should show error modal on failure', function () {
      spyOn(modalMessage, 'error');

      const updatedPromo = { id: 'promo-1', code: 'UPDATEDCODE', amount: 100 };
      const errorResponse = { error: { message: 'Not found' } };

      $httpBackend
        .expectPUT(`${mockUrl}/globalPromotions/promo-1`)
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
