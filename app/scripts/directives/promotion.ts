import angular from 'angular';
import { IScope } from 'angular';
import { Conference } from 'conference';
import { Promotion } from 'promotion';
import { GlobalPromotion } from 'globalPromotion';
import { MinistriesCache, MinistryActivity } from '../services/MinistriesCache';
import template from 'views/components/promotion.html';

interface PromotionScope extends IScope {
  // Bindings
  promo: Promotion | GlobalPromotion;
  conference?: Conference;
  onSave?: () => void;
  onDiscard?: () => void;
  onDelete?: () => void;

  // Local state and methods
  currencyCode: string;
  expanded: boolean;
  activities: MinistryActivity[];
  toggleExpanded: () => void;
  toggleRegistrantType: (id: string) => void;
}

angular.module('confRegistrationWebApp').directive('promotion', function () {
  return {
    templateUrl: template,
    restrict: 'E',
    scope: {
      promo: '=',
      conference: '=',
      onSave: '&?',
      onDiscard: '&?',
      onDelete: '&?',
    },
    controller($scope: PromotionScope, MinistriesCache: MinistriesCache) {
      $scope.currencyCode = $scope.conference?.currency.currencyCode ?? 'USD';

      $scope.expanded = false;
      $scope.toggleExpanded = function () {
        $scope.expanded = !$scope.expanded;
      };

      $scope.toggleRegistrantType = function (id: string) {
        // Only conference promotions have registrantTypeIds
        if ('registrantTypeIds' in $scope.promo) {
          if ($scope.promo.registrantTypeIds.indexOf(id) === -1) {
            $scope.promo.registrantTypeIds.push(id);
          } else {
            $scope.promo.registrantTypeIds.splice(
              $scope.promo.registrantTypeIds.indexOf(id),
              1,
            );
          }
        }
      };

      $scope.activities = [];
      if ('ministryId' in $scope.promo) {
        const ministryId = $scope.promo.ministryId;
        MinistriesCache.get().then((ministries) => {
          const ministry = ministries.find(
            (ministry) => ministry.id === ministryId,
          );
          if (ministry) {
            $scope.activities = ministry.activities;
          }
        });
      }
    },
  };
});
