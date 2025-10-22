import angular from 'angular';
import type { $RootScope } from 'injectables';
import type { GlobalPromotion } from 'globalPromotion';
import { GlobalPromotionService } from '../services/globalPromotionService';
import { MinistriesCache, Ministry } from '../services/MinistriesCache';

class GlobalPromotionsCtrl {
  promoCodes: GlobalPromotion[] = [];
  editingPromotion: GlobalPromotion | null = null;
  ministries: Ministry[] = [];

  /* @ngInject */
  constructor(
    private $rootScope: $RootScope,
    private globalPromotionService: GlobalPromotionService,
    private MinistriesCache: MinistriesCache,
  ) {
    this.$rootScope.globalPage = {
      type: 'admin',
      bodyClass: 'global-promotions',
      mainClass: 'container',
      footer: true,
    };

    this.MinistriesCache.get().then((ministries) => {
      this.ministries = ministries;
    });

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
      ministryId: '87b02878-5070-473b-bb07-3b2d899b46d6', // AIA
      ministryActivityId: null,
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

  getMinistryName(): string {
    const ministryId = this.editingPromotion?.ministryId;
    return (
      this.ministries.find((ministry) => ministry.id === ministryId)?.name ?? ''
    );
  }

  getActivityName(ministryActivityId: string | null): string {
    for (const ministry of this.ministries) {
      const activity = ministry.activities.find(
        (activity) => activity.id === ministryActivityId,
      );
      if (activity) {
        return activity.name;
      }
    }

    return '';
  }
}

angular
  .module('confRegistrationWebApp')
  .controller('globalPromotionsCtrl', GlobalPromotionsCtrl);
