angular
  .module('confRegistrationWebApp')
  .filter('paymentTypeFormat', function () {
    return function (paymentType) {
      if (angular.isUndefined(paymentType)) {
        return '';
      }

      if (paymentType === 'FL_GIFT_CARD') {
        return 'Gift card';
      }

      let paymentTypeString =
        paymentType.charAt(0).toUpperCase() +
        paymentType.substring(1).toLowerCase();
      paymentTypeString = paymentTypeString.replaceAll('_', ' ');
      return paymentTypeString;
    };
  });
