import angular from 'angular';
import { IPromise } from 'angular';
import { ModalMessage, $RootScope, $Http } from 'injectables';
import { GlobalPromotion } from 'globalPromotion';

const mockUrl = 'http://localhost:9001';

export class GlobalPromotionService {
  private globalPromosCache: GlobalPromotion[] | null = null;

  /* @ngInject */
  constructor(
    private $rootScope: $RootScope,
    private $http: $Http,
    private modalMessage: ModalMessage,
  ) {}

  loadPromoCodes(): IPromise<GlobalPromotion[]> {
    if (this.globalPromosCache !== null) {
      return Promise.resolve(this.globalPromosCache);
    }

    this.$rootScope.loadingMsg = 'Loading Promotions';

    return this.$http
      .get<GlobalPromotion[]>(`${mockUrl}/globalPromotions`)
      .then((response) => {
        this.globalPromosCache = response.data;
        return this.globalPromosCache;
      })
      .finally(() => {
        this.$rootScope.loadingMsg = '';
      });
  }

  clearConfGlobalPromoCache(): void {
    this.globalPromosCache = null;
  }

  getPromoCodesForConference(
    conferenceMinistryId: string,
    conferenceMinistryActivityId: string,
  ): GlobalPromotion[] {
    if (!this.globalPromosCache) {
      return [];
    }

    return this.globalPromosCache.filter((promo) => {
      const ministryMatches = promo.ministryId === conferenceMinistryId;
      const activityMatches =
        promo.ministryActivityId === conferenceMinistryActivityId;
      return ministryMatches && activityMatches;
    });
  }

  loadPromoCodesForConference(
    conferenceMinistryId: string,
    conferenceMinistryActivityId: string,
  ): IPromise<GlobalPromotion[]> {
    return this.loadPromoCodes().then(() => {
      return this.getPromoCodesForConference(
        conferenceMinistryId,
        conferenceMinistryActivityId,
      );
    });
  }

  hasPromoCodesForConference(
    conferenceMinistryId: string,
    conferenceMinistryActivityId: string,
  ): boolean {
    return (
      this.getPromoCodesForConference(
        conferenceMinistryId,
        conferenceMinistryActivityId,
      ).length > 0
    );
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
