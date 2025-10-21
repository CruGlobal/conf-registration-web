import angular from 'angular';
import { IPromise } from 'angular';
import { ModalMessage, $RootScope, $Http } from 'injectables';
import { GlobalPromotion } from 'globalPromotion';

const mockUrl = 'http://localhost:9001';

export class GlobalPromotionService {
  /* @ngInject */
  constructor(
    private $rootScope: $RootScope,
    private $http: $Http,
    private modalMessage: ModalMessage,
  ) {}

  loadPromoCodes(): IPromise<GlobalPromotion[]> {
    this.$rootScope.loadingMsg = 'Loading Promotions';

    return this.$http
      .get<GlobalPromotion[]>(`${mockUrl}/globalPromotions`)
      .then((response) => response.data)
      .finally(() => {
        this.$rootScope.loadingMsg = '';
      });
  }

  createPromoCode(promo: GlobalPromotion): IPromise<GlobalPromotion> {
    this.$rootScope.loadingMsg = 'Creating Promotion';

    return this.$http
      .post<GlobalPromotion>(`${mockUrl}/globalPromotions`, promo)
      .then((response) => response.data)
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
      .then((response) => response.data)
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
