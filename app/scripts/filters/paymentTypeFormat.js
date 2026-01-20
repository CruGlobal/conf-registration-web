angular
  .module('confRegistrationWebApp')
  .filter('paymentTypeFormat', function () {
    return function (paymentType) {
      if (angular.isUndefined(paymentType)) {
        return '';
      }
      if (paymentType === 'FL_GIFT_CARD') {
        return 'Gift Card';
      }
      return (
        paymentType.charAt(0).toUpperCase() +
        paymentType.substring(1).toLowerCase()
      );
    };
  });
