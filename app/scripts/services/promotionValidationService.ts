import angular from 'angular';
import { IPromise } from 'angular';
import { $Http, ModalMessage } from 'injectables';
import { Registration } from 'registration';
import { $q } from 'ngimport';

interface PromotionValidationRequest {
  promotions: string[];
  globalPromotions: string[];
}

interface PromotionValidationError {
  status: number;
  failedPromotions: string[];
  message: string;
  originalError?: any;
}

export class PromotionValidationService {
  /* @ngInject */
  constructor(readonly $http: $Http, private modalMessage: ModalMessage) {}

  verifyPromotionUsage(registration: Registration): IPromise<void> {
    const promotionCodes =
      registration.promotions?.map((promotion) => promotion.code) || [];
    const globalPromotionCodes =
      registration.globalPromotions?.map((promotion) => promotion.code) || [];

    // Skip validation if there are no promotions
    if (promotionCodes.length === 0 && globalPromotionCodes.length === 0) {
      return $q.resolve();
    }

    const requestBody: PromotionValidationRequest = {
      promotions: promotionCodes,
      globalPromotions: globalPromotionCodes,
    };

    return this.$http
      .post<void>(
        `registrations/${registration.id}/promotions/verify`,
        requestBody,
      )
      .then(() => {
        return;
      })
      .catch((errorResponse) => {
        const error = errorResponse?.data?.error;
        const failedPromotions = this.extractFailedPromotions(error);

        if (errorResponse.status === 409) {
          const failedCodes =
            failedPromotions.length > 0
              ? failedPromotions.join(', ')
              : 'one or more promotions';

          this.modalMessage.error({
            title: 'Promotion Limit Exceeded',
            message:
              'The following promotion codes have reached their usage limit: ' +
              failedCodes +
              '. Please remove the invalid promotions and try again.',
            forceAction: true,
          });
        } else {
          this.modalMessage.error({
            title: 'Promotion Validation Error',
            message:
              error?.message ||
              'Unable to verify promotion availability. Please try again.',
            forceAction: true,
          });
        }

        const validationError: PromotionValidationError = {
          status: errorResponse.status,
          failedPromotions: failedPromotions,
          message:
            error?.message ||
            'One or more promotions have exceeded their usage limit.',
          originalError: error,
        };

        return $q.reject(validationError);
      });
  }

  private extractFailedPromotions(error: any): string[] {
    if (error?.details?.failedPromotions) {
      return error.details.failedPromotions;
    }
    return [];
  }
}

angular
  .module('confRegistrationWebApp')
  .service('promotionValidationService', PromotionValidationService);
