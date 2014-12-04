'use strict';

angular.module('confRegistrationWebApp')
    .filter('paymentTypeFormat', function () {
        return function (paymentType) {
          if(angular.isUndefined(paymentType)) {
            return '';
          }
          return paymentType.charAt(0).toUpperCase() + paymentType.substring(1).toLowerCase();
        };
    });