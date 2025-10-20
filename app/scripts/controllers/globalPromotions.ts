import angular from 'angular';
import type { $RootScope } from 'injectables';

class GlobalPromotionsCtrl {
  /* @ngInject */
  constructor($rootScope: $RootScope) {
    $rootScope.globalPage = {
      type: 'admin',
      bodyClass: 'global-promotions',
      mainClass: 'container',
      footer: true,
    };
  }
}

angular
  .module('confRegistrationWebApp')
  .controller('globalPromotionsCtrl', GlobalPromotionsCtrl);
