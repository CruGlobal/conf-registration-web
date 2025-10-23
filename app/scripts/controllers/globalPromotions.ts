import angular from 'angular';
import type { $RootScope } from 'injectables';
import type { GlobalPromotion } from 'globalPromotion';
import { GlobalPromotionService } from '../services/globalPromotionService';

class GlobalPromotionsCtrl {
  promoCodes: GlobalPromotion[] = [];
  editingPromotion: GlobalPromotion | null = null;

  /* @ngInject */
  constructor(
    private $rootScope: $RootScope,
    private globalPromotionService: GlobalPromotionService,
  ) {
    this.$rootScope.globalPage = {
      type: 'admin',
      bodyClass: 'global-promotions',
      mainClass: 'container',
      footer: true,
    };

    this.globalPromotionService
      .loadPromotions('87b02878-5070-473b-bb07-3b2d899b46d6')
      .then((codes) => {
        this.promoCodes = codes;
      });
  }

  addPromoCode() {
    this.editingPromotion = {
      id: '',
      registrantTypeIds: [],
      name: '',
      code: '',
      amount: 0,
      description: '',
      active: true,
      businessUnit: '',
      operatingUnit: '',
      departmentId: '',
      projectId: '',
      ministryId: '',
      ministryActivityId: '',
      activationDate: new Date().toISOString(),
      deactivationDate: null,
      applyToAllRegistrants: true,
      createdDate: null,
      lastUpdateDate: null,
    };
  }

  editPromoCode(promotion: GlobalPromotion) {
    this.editingPromotion = angular.copy(promotion);
  }

  savePromoCode() {
    if (!this.editingPromotion) {
      return;
    }

    if (this.editingPromotion.id) {
      this.globalPromotionService
        .updatePromotion(this.editingPromotion)
        .then((updatedPromotion) => {
          const index = this.promoCodes.findIndex(
            ({ id }) => id === updatedPromotion.id,
          );
          if (index !== -1) {
            this.promoCodes[index] = updatedPromotion;
          }
          this.cancelEdit();
        });
    } else {
      this.globalPromotionService
        .createPromotion(this.editingPromotion)
        .then((newPromotion) => {
          this.promoCodes.push(newPromotion);
          this.cancelEdit();
        });
    }
  }

  cancelEdit() {
    this.editingPromotion = null;
  }
}

angular
  .module('confRegistrationWebApp')
  .controller('globalPromotionsCtrl', GlobalPromotionsCtrl);
