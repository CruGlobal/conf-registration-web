'use strict';

angular.module('confRegistrationWebApp')
  .filter('moneyFormat', function () {
    return function (num) {
      if(angular.isUndefined(num)){
        return '';
      }
      var p = num.toFixed(2).split('.');
      return '$' + p[0].split('').reverse().reduce(function(acc, num, i) {
        return  num + (i && ((i % 3) === 0) ? ',' : '') + acc;
      }, '') + '.' + p[1];
    };
  });