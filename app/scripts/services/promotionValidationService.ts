import angular from 'angular';
import { $Http } from 'injectables';
import { Registration } from 'registration';

export class PromotionValidationService {
  /* @ngInject */
  constructor(readonly $http: $Http) {}

  async verifyPromotionUsage(registration: Registration): Promise<void> {
    const promotions =
      registration.promotions?.map((promotion) => promotion.code) || [];
    const globalPromotions =
      registration.globalPromotions?.map((promotion) => promotion.code) || [];

    if (promotions.length === 0 && globalPromotions.length === 0) {
      return;
    }

    try {
      await this.$http.post<void>(
        `registrations/${registration.id}/promotions/verify`,
        { promotions, globalPromotions },
      );
    } catch (errorResponse: any) {
      const data = errorResponse?.data;
      const failedCodes = [
        ...(data?.promotions || []),
        ...(data?.globalPromotions || []),
      ].join(', ');

      throw {
        status: errorResponse.status,
        message:
          errorResponse.status === 409
            ? 'The following promotion codes have reached their usage limit: ' +
              (failedCodes || 'one or more promotions') +
              '.<br>Please remove the invalid promotion(s) and try again.'
            : data?.error?.message ||
              'Unable to verify promotion availability. Please try again.',
      };
    }
  }
}

angular
  .module('confRegistrationWebApp')
  .service('promotionValidationService', PromotionValidationService);
