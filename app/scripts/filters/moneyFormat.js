'use strict';

angular.module('confRegistrationWebApp')
  .filter('moneyFormat', function () {
    return function (num) {
      if(angular.isUndefined(num) || _.isNull(num)){
        return '';
      }
      return '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    };
  });
