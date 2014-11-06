'use strict';

angular.module('confRegistrationWebApp')
  .directive('ertPayment', function () {
    return {
      templateUrl: 'views/components/payment.html',
      restrict: 'A',
      controller: function ($scope) {
        $scope.currentYear = new Date().getFullYear();

        $scope.paymentMethodsViews = {
          CREDIT_CARD: 'views/paymentMethods/creditCard.html',
          TRANSFER: 'views/paymentMethods/transfer.html'
        };
      }
    };
  });