import angular from 'angular';
import type { $RootScope } from 'injectables';
import type { GlobalPromotion } from 'globalPromotion';
import { GlobalPromotionService } from '../services/globalPromotionService';
import { Ministry, MinistriesCache } from '../services/MinistriesCache';

class GlobalPromotionsCtrl {
  promotions: GlobalPromotion[] = [];
  editingPromotion: GlobalPromotion | null = null;
  ministries: Ministry[] = [];
  selectedMinistryId: string | null = null;
  noAccess: boolean;
  showMinistrySelector: boolean;

  /* @ngInject */
  constructor(
    private $rootScope: $RootScope,
    private globalPromotionService: GlobalPromotionService,
    private MinistriesCache: MinistriesCache,
    ministries: Ministry[],
  ) {
    this.$rootScope.globalPage = {
      type: 'admin',
      bodyClass: 'global-promotions',
      mainClass: 'container',
      footer: true,
    };

    this.ministries = ministries;
    this.noAccess = ministries.length === 0;
    this.showMinistrySelector = ministries.length > 1;
    if (this.ministries.length >= 1) {
      this.selectedMinistryId = this.ministries[0].id;
      this.loadMinistryPromotions();
    }
  }

  loadMinistryPromotions() {
    if (!this.selectedMinistryId) {
      return;
    }

    this.globalPromotionService
      .loadPromotions(this.selectedMinistryId)
      .then((promotions) => {
        this.promotions = promotions;
      });
  }

  addPromotion() {
    if (!this.selectedMinistryId) {
      return;
    }

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
      ministryId: this.selectedMinistryId,
      ministryActivityId: null,
      activationDate: new Date().toISOString(),
      deactivationDate: null,
      applyToAllRegistrants: true,
      createdDate: null,
      lastUpdateDate: null,
    };
  }

  editPromotion(promotion: GlobalPromotion) {
    this.editingPromotion = angular.copy(promotion);
  }

  savePromotion() {
    if (!this.editingPromotion) {
      return;
    }

    if (this.editingPromotion.id) {
      this.globalPromotionService
        .updatePromotion(this.editingPromotion)
        .then((updatedPromotion) => {
          const index = this.promotions.findIndex(
            ({ id }) => id === updatedPromotion.id,
          );
          if (index !== -1) {
            this.promotions[index] = updatedPromotion;
          }
          this.cancelEdit();
        });
    } else {
      this.globalPromotionService
        .createPromotion(this.editingPromotion)
        .then((newPromotion) => {
          this.promotions.push(newPromotion);
          this.cancelEdit();
        });
    }
  }

  cancelEdit() {
    this.editingPromotion = null;
  }

  getMinistryName(): string {
    if (!this.selectedMinistryId) {
      return '';
    }
    return this.MinistriesCache.getMinistryName(this.selectedMinistryId) ?? '';
  }

  getActivityName(ministryActivityId: string | null): string {
    if (!this.selectedMinistryId || !ministryActivityId) {
      return '';
    }
    return (
      this.MinistriesCache.getActivityName(
        this.selectedMinistryId,
        ministryActivityId,
      ) ?? ''
    );
  }
}

angular
  .module('confRegistrationWebApp')
  .controller('globalPromotionsCtrl', GlobalPromotionsCtrl);
