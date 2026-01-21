angular
  .module('confRegistrationWebApp')
  .filter('paymentTypeFormat', function () {
    return function (paymentType) {
      if (angular.isUndefined(paymentType)) {
        return '';
      }

      let paymentTypeString =
        paymentType.charAt(0).toUpperCase() +
        paymentType.substring(1).toLowerCase();
      paymentTypeString = paymentTypeString.replaceAll('_', ' ');
      return paymentTypeString;
    };
  });
