import 'angular-mocks';

describe('Controller: globalPromotionsCtrl', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let controller,
    $rootScope,
    $q,
    globalPromotionService,
    MinistriesCache,
    globalPromotions,
    ministries;

  beforeEach(
    angular.mock.inject((_$rootScope_, $controller, _$q_, testData) => {
      $rootScope = _$rootScope_;
      $q = _$q_;
      globalPromotions = testData.globalPromotions;
      ministries = testData.ministries;

      globalPromotionService = {
        loadPromotions: jasmine
          .createSpy('loadPromotions')
          .and.returnValue($q.resolve(globalPromotions)),
        createPromotion: jasmine
          .createSpy('createPromotion')
          .and.callFake((promotion) =>
            $q.resolve({ ...promotion, id: 'new-promo-id' }),
          ),
        updatePromotion: jasmine
          .createSpy('updatePromotion')
          .and.callFake((promotion) => $q.resolve(promotion)),
      };

      MinistriesCache = {
        getMinistryName: jasmine.createSpy('getMinistryName'),
        getActivityName: jasmine.createSpy('getActivityName'),
      };

      controller = $controller('globalPromotionsCtrl', {
        $rootScope,
        globalPromotionService,
        MinistriesCache,
        ministries,
      });
    }),
  );

  describe('initialization', () => {
    it('should initialize state', () => {
      expect(controller.ministries).toEqual(ministries);
      expect(controller.noAccess).toBe(false);
      expect(controller.selectedMinistryId).toBe(ministries[0].id);
      expect(controller.showMinistrySelector).toBe(true);
    });

    describe('no ministries', () => {
      let controller;
      beforeEach(() => {
        angular.mock.inject(($controller) => {
          controller = $controller('globalPromotionsCtrl', {
            $rootScope,
            globalPromotionService,
            MinistriesCache,
            ministries: [],
          });
        });
      });

      it('should set noAccess to true and hide ministry selector', () => {
        expect(controller.noAccess).toBe(true);
        expect(controller.selectedMinistryId).toBe(null);
        expect(controller.showMinistrySelector).toBe(false);
      });
    });

    describe('one ministry', () => {
      let controller;
      beforeEach(() => {
        angular.mock.inject(($controller) => {
          controller = $controller('globalPromotionsCtrl', {
            $rootScope,
            globalPromotionService,
            MinistriesCache,
            ministries: [ministries[0]],
          });
        });
      });

      it('should set noAccess to false and hide ministry selector', () => {
        expect(controller.noAccess).toBe(false);
        expect(controller.selectedMinistryId).toBe(ministries[0].id);
        expect(controller.showMinistrySelector).toBe(false);
      });
    });

    it('should load promotions', () => {
      expect(globalPromotionService.loadPromotions).toHaveBeenCalledWith(
        ministries[0].id,
      );

      $rootScope.$digest();

      expect(controller.promotions).toEqual(globalPromotions);
    });
  });

  describe('loadMinistryPromotions', () => {
    it('should load promotions for selected ministry', () => {
      globalPromotionService.loadPromotions.calls.reset();
      controller.selectedMinistryId = ministries[1].id;

      controller.loadMinistryPromotions();
      $rootScope.$digest();

      expect(globalPromotionService.loadPromotions).toHaveBeenCalledWith(
        controller.selectedMinistryId,
      );

      expect(controller.promotions).toEqual(globalPromotions);
    });
  });

  describe('addPromotion', () => {
    it('should initialize a new promotion with default values', () => {
      controller.addPromotion();

      expect(controller.editingPromotion.id).toBe('');
      expect(controller.editingPromotion.ministryId).toBe(
        controller.selectedMinistryId,
      );
    });
  });

  describe('editPromotion', () => {
    it('should copy promotion for editing', () => {
      const promotion = globalPromotions[0];
      controller.editPromotion(promotion);

      expect(controller.editingPromotion).toEqual(promotion);
      expect(controller.editingPromotion).not.toBe(promotion);
    });
  });

  describe('savePromotion', () => {
    describe('creating new promotion', () => {
      beforeEach(() => {
        $rootScope.$digest();
        controller.editingPromotion = { id: '', name: 'New Promotion' };
      });

      it('should call createPromotion service', () => {
        controller.savePromotion();

        expect(globalPromotionService.createPromotion).toHaveBeenCalledWith(
          controller.editingPromotion,
        );
      });

      it('should add new promotion to promotions list', () => {
        const editingPromotion = controller.editingPromotion;

        expect(controller.promotions.length).toBe(3);

        controller.savePromotion();
        $rootScope.$digest();

        expect(controller.promotions.length).toBe(4);
        expect(controller.promotions).toContain({
          ...editingPromotion,
          id: 'new-promo-id',
        });
      });

      it('should clear editingPromotion', () => {
        controller.savePromotion();
        $rootScope.$digest();

        expect(controller.editingPromotion).toBeNull();
      });
    });

    describe('updating existing promotion', () => {
      beforeEach(() => {
        controller.editingPromotion = {
          ...globalPromotions[0],
          name: 'Updated Promotion',
        };
        $rootScope.$digest();
      });

      it('should call updatePromotion service', () => {
        controller.savePromotion();

        expect(globalPromotionService.updatePromotion).toHaveBeenCalledWith(
          controller.editingPromotion,
        );
      });

      it('should update promotion in promotions list', () => {
        controller.savePromotion();
        $rootScope.$digest();

        expect(controller.promotions[0].name).toBe('Updated Promotion');
        expect(controller.promotions.length).toBe(3);
      });

      it('should clear editingPromotion after successful save', () => {
        controller.savePromotion();
        $rootScope.$digest();

        expect(controller.editingPromotion).toBeNull();
      });
    });
  });

  describe('cancelEdit', () => {
    it('should clear editingPromotion', () => {
      controller.editingPromotion = globalPromotions[0];
      controller.cancelEdit();

      expect(controller.editingPromotion).toBeNull();
    });
  });

  describe('getMinistryName', () => {
    it('should delegate to MinistriesCache when a ministry is selected', () => {
      MinistriesCache.getMinistryName.and.returnValue(ministries[1].name);
      controller.selectedMinistryId = ministries[1].id;

      expect(controller.getMinistryName()).toBe(ministries[1].name);
    });

    it('should return empty string when no ministry is selected', () => {
      controller.selectedMinistryId = null;

      expect(controller.getMinistryName()).toBe('');
    });
  });

  describe('getActivityName', () => {
    it('should delegate to MinistriesCache when a ministry is selected', () => {
      const activity = ministries[0].activities[0];
      MinistriesCache.getActivityName.and.returnValue(activity.name);
      controller.selectedMinistryId = ministries[0].id;

      expect(controller.getActivityName(activity.id)).toBe(activity.name);
    });

    it('should return empty string when no ministry is selected', () => {
      const activity = ministries[0].activities[0];
      controller.selectedMinistryId = null;

      expect(controller.getActivityName(activity.id)).toBe('');
    });

    it('should return empty string for null activity', () => {
      expect(controller.getActivityName(null)).toBe('');
    });
  });
});
