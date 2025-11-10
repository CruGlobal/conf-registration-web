import angular from 'angular';
import type { $RootScope } from 'injectables';
import type { GlobalPromotion } from 'globalPromotion';
import { GlobalPromotionService } from '../services/globalPromotionService';
import { Ministry, MinistriesCache } from '../services/MinistriesCache';
import moment from 'moment';

class GlobalPromotionsCtrl {
  promotions: GlobalPromotion[] = [];
  editingPromotion: GlobalPromotion | null = null;
  ministries: Ministry[] = [];
  selectedMinistryId: string | null = null;
  noAccess: boolean;
  showMinistrySelector: boolean;
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  codeFilter = '';
  orderByField = 'code';
  reverseSort = false;

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
      name: '',
      code: '',
      amount: 0,
      description: '',
      businessUnit: '',
      operatingUnit: '',
      departmentId: '',
      projectId: '',
      ministryId: this.selectedMinistryId,
      ministryActivityId: '',
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
    if (!this.selectedMinistryId) {
      return '';
    }
    return this.MinistriesCache.getMinistryName(this.selectedMinistryId) ?? '';
  }

  getActivityName(ministryActivityId: string): string {
    if (!this.selectedMinistryId) {
      return '';
    }
    return (
      this.MinistriesCache.getActivityName(
        this.selectedMinistryId,
        ministryActivityId,
      ) ?? ''
    );
  }

  formatDate(date: string | null): string {
    if (!date) {
      return '';
    }
    return moment(date).format('MMM D, YYYY h:mm A');
  }

  isActive(promotion: GlobalPromotion): boolean {
    return this.globalPromotionService.isPromotionActive(promotion);
  }

  setOrder(field: string) {
    if (this.orderByField === field) {
      this.reverseSort = !this.reverseSort;
    } else {
      this.orderByField = field;
      this.reverseSort = false;
    }
  }

  getStatusForSorting(promotion: GlobalPromotion): string {
    return this.isActive(promotion) ? 'Active' : 'Inactive';
  }

  get sortField(): string | ((promotion: GlobalPromotion) => string) {
    return this.orderByField === 'status'
      ? (promotion) => this.getStatusForSorting(promotion)
      : this.orderByField;
  }

  get filteredPromotions(): GlobalPromotion[] {
    return this.promotions.filter((promotion) => {
      if (this.statusFilter !== 'all') {
        const isActive = this.isActive(promotion);
        const matchesStatus =
          this.statusFilter === 'active' ? isActive : !isActive;
        if (!matchesStatus) {
          return false;
        }
      }

      if (this.codeFilter) {
        const codeMatch = promotion.code
          .toLowerCase()
          .includes(this.codeFilter.toLowerCase());
        if (!codeMatch) {
          return false;
        }
      }

      return true;
    });
  }

  setStatusFilter(filter: 'all' | 'active' | 'inactive') {
    this.statusFilter = filter;
  }
}

angular
  .module('confRegistrationWebApp')
  .controller('globalPromotionsCtrl', GlobalPromotionsCtrl);
