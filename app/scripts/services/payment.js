'use strict';

angular.module('confRegistrationWebApp')
  .factory('payment', function ($q, $http, $filter, error) {
    // Modify a credit card payment to use a tokenized credit card instead of real credit card data
    function tokenizeCreditCardPayment (payment) {
      return $http.get('payments/ccp-client-encryption-key').then(function (res) {
        var ccpClientEncryptionKey = res.data;
        ccp.initialize(ccpClientEncryptionKey);
        payment.creditCard.lastFourDigits = ccp.getAbbreviatedNumber(payment.creditCard.number);
        payment.creditCard.number = ccp.encrypt(payment.creditCard.number);
        payment.creditCard.cvvNumber = ccp.encrypt(payment.creditCard.cvvNumber);
      }).catch(error.errorFromResponse('An error occurred while requesting the ccp encryption key. Please try your payment again.'));
    }

    return {
      // Validate a payment and return a boolean indicating whether or not it is valid
      validate: function (payment, registration) {
        /*
        If the totalPaid (previously) AND the amount of this payment are less than the minimum required deposit, then
        show and error message. The first payment must be at least the minimum deposit amount. Subsequent payments can be
        less than the amount. This is confirmed by making sure the total previously paid is above the min deposit amount.
        */

        if (registration.pastPayments.length === 0 && Number(payment.amount) < registration.calculatedMinimumDeposit) {
          payment.errors.push('You are required to pay at least the minimum deposit of ' + $filter('currency')(registration.calculatedMinimumDeposit, '$') + ' to register for this event.');
        }

        if (Number(payment.amount) > registration.remainingBalance) {
          payment.errors.push('You are paying more than the total due of ' + $filter('currency')(registration.remainingBalance, '$') + ' to register for this event.');
        }

        // The payment is valid if it has no errors
        return _.isEmpty(payment.errors);
      },

      // Submit payment for a current registration
      pay: function (payment, registration, acceptedPaymentMethods) {
        if (Number(payment.amount) === 0 || !acceptedPaymentMethods || payment.paymentType === 'PAY_ON_SITE') {
          // No payment is necessary, so no work needs to be done here
          return $q.when();
        }

        // Prepare the payment object
        var currentPayment = angular.copy(payment);
        currentPayment.registrationId = registration.id;
        delete currentPayment.errors;

        return $q.when().then(function () {
          if (currentPayment.paymentType === 'CREDIT_CARD') {
            // Credit card payments must be tokenized first
            return tokenizeCreditCardPayment(currentPayment);
          }
        }).then(function () {
          // Submit the payment
          return $http.post('payments/', currentPayment);
        }).catch(error.errorFromResponse('An error occurred while attempting to process your payment.'));
      }
    };
  });
