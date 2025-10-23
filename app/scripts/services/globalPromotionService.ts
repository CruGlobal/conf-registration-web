import angular from 'angular';
import { IPromise } from 'angular';
import { ModalMessage, $RootScope, $Http } from 'injectables';
import { GlobalPromotion } from 'globalPromotion';
import { $q } from 'ngimport';

const mockUrl = 'http://localhost:9001';

export class GlobalPromotionService {
  private globalPromotionsCache: angular.ICacheObject;

  /* @ngInject */
  constructor(
    private $rootScope: $RootScope,
    private $http: $Http,
    private modalMessage: ModalMessage,
    $cacheFactory: angular.ICacheFactoryService,
  ) {
    this.globalPromotionsCache = $cacheFactory('globalPromotionsCache');
  }

  private getCacheKey(ministryId: string, ministryActivityId?: string): string {
    return `${ministryId}:${ministryActivityId || 'all'}`;
  }

  loadPromotions(
    ministryId: string,
    ministryActivityId?: string,
  ): IPromise<GlobalPromotion[]> {
    const cacheKey = this.getCacheKey(ministryId, ministryActivityId);

    const cachedData =
      this.globalPromotionsCache.get<GlobalPromotion[]>(cacheKey);
    if (cachedData) {
      return $q.resolve(cachedData);
    }

    this.$rootScope.loadingMsg = 'Loading Promotions';
    const params: Record<string, string> = { ministryId };

    if (ministryActivityId) {
      params.ministryActivityId = ministryActivityId;
    }

    return this.$http
      .get<GlobalPromotion[]>(`${mockUrl}/globalPromotions`, { params })
      .then((response) => {
        this.globalPromotionsCache.put(cacheKey, response.data);
        return response.data;
      })
      .finally(() => {
        this.$rootScope.loadingMsg = '';
      });
  }

  private updateCacheWithPromotion(
    newPromotion: GlobalPromotion,
    isUpdate = false,
  ): void {
    const cacheKey = this.getCacheKey(
      newPromotion.ministryId,
      newPromotion.ministryActivityId,
    );
    const cachedData =
      this.globalPromotionsCache.get<GlobalPromotion[]>(cacheKey);

    if (!cachedData) {
      return;
    }

    if (isUpdate) {
      // Replace the updated promotion in the cached array
      const updatedCacheData = cachedData.map((currentPromotion) =>
        currentPromotion.id === newPromotion.id
          ? newPromotion
          : currentPromotion,
      );
      this.globalPromotionsCache.put(cacheKey, updatedCacheData);
      return;
    }
    // Add new promotion
    this.globalPromotionsCache.put(cacheKey, [...cachedData, newPromotion]);
  }

  hasPromotionsForConference(
    conferenceMinistryId: string,
    conferenceMinistryActivityId: string,
  ): boolean {
    const cacheKey = this.getCacheKey(
      conferenceMinistryId,
      conferenceMinistryActivityId,
    );
    const cachedData =
      this.globalPromotionsCache.get<GlobalPromotion[]>(cacheKey);
    return cachedData ? cachedData.length > 0 : false;
  }

  createPromotion(promo: GlobalPromotion): IPromise<GlobalPromotion> {
    this.$rootScope.loadingMsg = 'Creating Promotion';

    return this.$http
      .post<GlobalPromotion>(`${mockUrl}/globalPromotions`, promo)
      .then((response) => {
        this.updateCacheWithPromotion(response.data);
        return response.data;
      })
      .catch((errorResponse) => {
        const error = errorResponse?.data?.error;
        this.modalMessage.error({
          title: 'Error Creating Promotion',
          message: error || 'Failed to create promotion.',
        });
        throw error;
      })
      .finally(() => {
        this.$rootScope.loadingMsg = '';
      });
  }

  updatePromotion(promo: GlobalPromotion): IPromise<GlobalPromotion> {
    this.$rootScope.loadingMsg = 'Updating Promotion';

    return this.$http
      .put<GlobalPromotion>(`${mockUrl}/globalPromotions/${promo.id}`, promo)
      .then((response) => {
        this.updateCacheWithPromotion(response.data, true);
        return response.data;
      })
      .catch((errorResponse) => {
        const error = errorResponse?.data?.error;
        this.modalMessage.error({
          title: 'Error Updating Promotion',
          message: error || 'Failed to update promotion.',
        });
        throw error;
      })
      .finally(() => {
        this.$rootScope.loadingMsg = '';
      });
  }
}

angular
  .module('confRegistrationWebApp')
  .service('globalPromotionService', GlobalPromotionService);
