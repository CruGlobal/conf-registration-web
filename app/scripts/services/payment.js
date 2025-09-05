import * as cruPayments from '@cruglobal/cru-payments/dist/cru-payments-cc';
import { Rollbar } from 'scripts/errorNotify.js';

angular
  .module('confRegistrationWebApp')
  .factory(
    'payment',
    function ($q, $http, $filter, envService, error, gettextCatalog) {
      // Load the TSYS manifest
      // Returns a promise that resolves to an object containing the manifest and device id
      function loadTsysManifest(payment) {
        var url = 'payments/appManifest';
        return $http.get(url, { data: payment }).then(function (res) {
          return res.data;
        });
      }

      // Modify a credit card payment to use a tokenized credit card instead of real credit card data
      // Tokenize the credit card via TSYS
      function tokenizeCreditCardPaymentTsys(payment) {
        return $q
          .when()
          .then(function () {
            return loadTsysManifest(payment);
          })
          .then(function (appManifest) {
            cruPayments.init(
              envService.read('tsysEnvironment'),
              appManifest.deviceId,
              appManifest.manifest,
            );
            return cruPayments
              .encrypt(
                payment.creditCard.number,
                payment.creditCard.cvvNumber,
                payment.creditCard.expirationMonth,
                payment.creditCard.expirationYear,
              )
              .toPromise($q);
          })
          .then(function (tokenizedCard) {
            payment.creditCard.lastFourDigits = tokenizedCard.maskedCardNumber;
            payment.creditCard.number = tokenizedCard.tsepToken;
            payment.creditCard.network = tokenizedCard.cardType;
          })
          .catch(
            error.errorFromResponse(
              gettextCatalog.getString(
                'An error occurred while requesting the TSYS token. Please try your payment again.',
              ),
            ),
          );
      }

      // Modify a credit card payment for a particular conference to use a tokenized credit card instead of real credit card data
      function tokenizeCreditCardPayment(conference, payment) {
        if (conference.paymentGatewayType === 'TSYS') {
          return tokenizeCreditCardPaymentTsys(payment);
        } else {
          Rollbar.warning('Unrecognized payment gateway', conference);
          throw new Error(
            gettextCatalog.getString('Unrecognized payment gateway.'),
          );
        }
      }

      return {
        // Validate a payment and return a boolean indicating whether or not it is valid
        validate: function (payment, registration, conference) {
          /*
        If the totalPaid (previously) AND the amount of this payment are less than the minimum required deposit, then
        show and error message. The first payment must be at least the minimum deposit amount. Subsequent payments can be
        less than the amount. This is confirmed by making sure the total previously paid is above the min deposit amount.
        */

          if (
            registration.pastPayments.length === 0 &&
            Number(payment.amount) < registration.calculatedMinimumDeposit
          ) {
            var minimumDeposit = $filter('localizedCurrency')(
              registration.calculatedMinimumDeposit,
              conference.currency.currencyCode,
            );
            payment.errors.push(
              gettextCatalog.getString(
                'You are required to pay at least the minimum deposit of {{minimumDeposit}} to register for this event.',
                { minimumDeposit: minimumDeposit },
              ),
            );
          }

          if (Number(payment.amount) > registration.remainingBalance) {
            var remainingBalance = $filter('localizedCurrency')(
              registration.remainingBalance,
              conference.currency.currencyCode,
            );
            payment.errors.push(
              gettextCatalog.getString(
                'You are paying more than the total due of {{remainingBalance}} to register for this event.',
                { remainingBalance: remainingBalance },
              ),
            );
          }

          // The payment is valid if it has no errors
          return _.isEmpty(payment.errors);
        },

        tokenizeCreditCardPayment: tokenizeCreditCardPayment,

        // Determine the accepted payment methods for an array of registrant types
        getAcceptedPaymentMethods: function (registrantTypes) {
          return {
            acceptCreditCards: _.some(registrantTypes, 'acceptCreditCards'),
            acceptChecks: _.some(registrantTypes, 'acceptChecks'),
            acceptTransfers: _.some(registrantTypes, 'acceptTransfers'),
            acceptScholarships: _.some(registrantTypes, 'acceptScholarships'),
            acceptPayOnSite: _.some(registrantTypes, 'acceptPayOnSite'),
          };
        },

        // Submit payment for a current registration
        // BREAKING CHANGE: removed acceptedPaymentMethods parameter
        // ASSUMPTION: it is impossible for payment.pay to be called when there aren't any accepted payment methods
        pay: function (payment, conference, registration) {
          if (
            Number(payment.amount) === 0 ||
            // The paymentType can be undefined if the conference has no accepted payment methods
            typeof payment.paymentType === 'undefined' ||
            payment.paymentType === 'PAY_ON_SITE'
          ) {
            // No payment is necessary, so no work needs to be done here
            return $q.when();
          }

          // Prepare the payment object
          var currentPayment = angular.copy(payment);
          currentPayment.registrationId = registration.id;
          delete currentPayment.errors;

          return $q
            .when()
            .then(function () {
              if (currentPayment.paymentType === 'CREDIT_CARD') {
                // Credit card payments must be tokenized first
                return tokenizeCreditCardPayment(conference, currentPayment);
              }
            })
            .then(function () {
              // Submit the payment
              return $http.post('payments/', currentPayment);
            })
            .catch(
              error.errorFromResponse(
                gettextCatalog.getString(
                  'An error occurred while attempting to process your payment.',
                ),
              ),
            );
        },
      };
    },
  );
