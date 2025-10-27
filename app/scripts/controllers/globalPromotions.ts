import angular from 'angular';
import type { $RootScope } from 'injectables';
import type { GlobalPromotion } from 'globalPromotion';
import { GlobalPromotionService } from '../services/globalPromotionService';
import { Ministry } from '../services/MinistriesCache';
import moment from 'moment';

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
      name: '',
      code: '',
      amount: 0,
      description: '',
      businessUnit: '',
      operatingUnit: '',
      departmentId: '',
      projectId: '',
      ministryId: this.selectedMinistryId,
      ministryActivityId: null,
      activationDate: moment().format('YYYY-MM-DD HH:mm:ss'),
      deactivationDate: null,
      applyToAllRegistrants: true,
      createdDate: null,
      lastUpdateDate: null,
      numberLimit: null,
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
    return (
      this.ministries.find(
        (ministry) => ministry.id === this.selectedMinistryId,
      )?.name ?? ''
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

  formatDate(date: string | null): string {
    if (!date) {
      return '';
    }
    return moment(date).format('MMM D, YYYY h:mm A');
  }
}

angular
  .module('confRegistrationWebApp')
  .controller('globalPromotionsCtrl', GlobalPromotionsCtrl);
