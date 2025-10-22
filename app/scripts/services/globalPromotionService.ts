import angular from 'angular';
import { IPromise } from 'angular';
import { ModalMessage, $RootScope, $Http } from 'injectables';
import { GlobalPromotion } from 'globalPromotion';

const mockUrl = 'http://localhost:9001';

export class GlobalPromotionService {
  private globalPromosCache: {
    [key: string]: GlobalPromotion[];
  } = {};

  /* @ngInject */
  constructor(
    private $rootScope: $RootScope,
    private $http: $Http,
    private modalMessage: ModalMessage,
  ) {}

  private getCacheKey(
    ministryId?: string,
    ministryActivityId?: string,
  ): string {
    // API ignores ministryActivityId if ministryId is not provided
    // So normalize the cache key to reflect actual API behavior
    if (!ministryId) {
      return 'all:all';
    }
    return `${ministryId}:${ministryActivityId || 'all'}`;
  }

  loadPromoCodes(
    ministryId?: string,
    ministryActivityId?: string,
  ): IPromise<GlobalPromotion[]> {
    const cacheKey = this.getCacheKey(ministryId, ministryActivityId);

    // Return cached data if available
    if (this.globalPromosCache[cacheKey]) {
      return Promise.resolve(this.globalPromosCache[cacheKey]);
    }

    this.$rootScope.loadingMsg = 'Loading Promotions';
    const params: { [key: string]: string } = {};
    if (ministryId) {
      params.ministryId = ministryId;
      if (ministryActivityId) {
        params.ministryActivityId = ministryActivityId;
      }
    }

    return this.$http
      .get<GlobalPromotion[]>(`${mockUrl}/globalPromotions`, { params })
      .then((response) => {
        this.globalPromosCache[cacheKey] = response.data;
        return response.data;
      })
      .finally(() => {
        this.$rootScope.loadingMsg = '';
      });
  }

  clearConfGlobalPromoCache(): void {
    this.globalPromosCache = {};
  }

  hasPromoCodesForConference(
    conferenceMinistryId: string,
    conferenceMinistryActivityId: string,
  ): boolean {
    const cacheKey = this.getCacheKey(
      conferenceMinistryId,
      conferenceMinistryActivityId,
    );
    return this.globalPromosCache[cacheKey]
      ? this.globalPromosCache[cacheKey].length > 0
      : false;
  }

  createPromoCode(promo: GlobalPromotion): IPromise<GlobalPromotion> {
    this.$rootScope.loadingMsg = 'Creating Promotion';

    return this.$http
      .post<GlobalPromotion>(`${mockUrl}/globalPromotions`, promo)
      .then((response) => {
        this.clearConfGlobalPromoCache();
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

  updatePromoCode(promo: GlobalPromotion): IPromise<GlobalPromotion> {
    this.$rootScope.loadingMsg = 'Updating Promotion';

    return this.$http
      .put<GlobalPromotion>(`${mockUrl}/globalPromotions/${promo.id}`, promo)
      .then((response) => {
        this.clearConfGlobalPromoCache();
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
