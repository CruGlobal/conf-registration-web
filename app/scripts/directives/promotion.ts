import angular from 'angular';
import { IScope } from 'angular';
import { Conference } from 'conference';
import { Promotion } from 'promotion';
import template from 'views/components/promotion.html';

interface PromotionScope extends IScope {
  // Bindings
  promo: Promotion;
  conference?: Conference;
  onDelete?: () => void;

  // Local state and methods
  currencyCode: string;
  expanded: boolean;
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
      onDelete: '&?',
    },
    controller: function ($scope: PromotionScope) {
      $scope.currencyCode = $scope.conference?.currency.currencyCode ?? 'USD';

      $scope.expanded = false;
      $scope.toggleExpanded = function () {
        $scope.expanded = !$scope.expanded;
      };

      $scope.toggleRegistrantType = function (id: string) {
        if ($scope.promo.registrantTypeIds.indexOf(id) === -1) {
          $scope.promo.registrantTypeIds.push(id);
        } else {
          $scope.promo.registrantTypeIds.splice(
            $scope.promo.registrantTypeIds.indexOf(id),
            1,
          );
        }
      };
    },
  };
});
