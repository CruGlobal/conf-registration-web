import cruPayments from 'cru-payments/dist/cru-payments-cc';

import template from 'views/components/payment.html';
import creditCardTemplate from 'views/paymentMethods/creditCard.html';
import creditCardOfflineTemplate from 'views/paymentMethods/creditCardOffline.html';
import checkAdminTemplate from 'views/paymentMethods/checkAdmin.html';
import checkTemplate from 'views/paymentMethods/check.html';
import transferTemplate from 'views/paymentMethods/transfer.html';
import scholarshipAdminTemplate from 'views/paymentMethods/scholarshipAdmin.html';
import scholarshipTemplate from 'views/paymentMethods/scholarship.html';
import payOnSiteTemplate from 'views/paymentMethods/payOnSite.html';
import additionalExpenseTemplate from 'views/paymentMethods/additionalExpense.html';

angular.module('confRegistrationWebApp').directive('ertPayment', function() {
  return {
    templateUrl: template,
    restrict: 'A',
    scope: {
      currentPayment: '=payment',
      currentRegistration: '=registration',
      paymentMethods: '=paymentMethods',
      isAdminPayment: '=adminPayment',
    },
    controller: function($scope, $http, expenseTypesConstants, gettextCatalog) {
      $scope.conference = $scope.$parent.conference;
      $scope.expenseTypesConstants = expenseTypesConstants;
      $scope.currentYear = new Date().getFullYear();
      $scope.creditCardCountry = 'US';

      $scope.paymentMethodsViews = {
        CREDIT_CARD: creditCardTemplate,
        OFFLINE_CREDIT_CARD: creditCardOfflineTemplate,
        CHECK: $scope.isAdminPayment ? checkAdminTemplate : checkTemplate,
        TRANSFER: transferTemplate,
        SCHOLARSHIP: $scope.isAdminPayment
          ? scholarshipAdminTemplate
          : scholarshipTemplate,
        PAY_ON_SITE: payOnSiteTemplate,
        ADDITIONAL_EXPENSE: additionalExpenseTemplate,
      };

      $scope.searchStaff = function(val) {
        return $http
          .get(
            'registrations/' + $scope.currentRegistration.id + '/staffsearch',
            { params: { name: val } },
          )
          .then(function(response) {
            return response.data;
          });
      };

      $scope.selectStaff = function(item) {
        $scope.currentPayment.scholarship = {
          staffApprovalName: item.firstName + ' ' + item.lastName,
          staffEmail: item.email,
        };
      };

      //payment validation
      $scope.$watch(
        'currentPayment',
        function(currentPayment) {
          if (angular.isUndefined(currentPayment)) {
            return;
          }
          currentPayment = angular.copy(currentPayment);
          if (!currentPayment.creditCard) {
            currentPayment.creditCard = {};
          }
          if (!currentPayment.offlineCreditCard) {
            currentPayment.offlineCreditCard = {};
          }
          if (!currentPayment.transfer) {
            currentPayment.transfer = {};
          }
          if (!currentPayment.scholarship) {
            currentPayment.scholarship = {};
          }
          if (!currentPayment.check) {
            currentPayment.check = {};
          }

          //validate SCHOLARSHIP payments as TRANSFER payments when admin
          if (
            currentPayment.paymentType === 'SCHOLARSHIP' &&
            $scope.isAdminPayment
          ) {
            currentPayment.paymentType = 'TRANSFER';
            currentPayment.transfer = currentPayment.scholarship;
          }

          function required(value) {
            return Boolean(value);
          }

          var paymentErrors = [];
          if (angular.isUndefined(currentPayment.paymentType)) {
            paymentErrors.push(
              gettextCatalog.getString('Please select a payment method.'),
            );
          } else {
            switch (currentPayment.paymentType) {
              case 'CREDIT_CARD':
                var validations = {
                  nameOnCard: [
                    {
                      validate: required,
                      errorMessage: gettextCatalog.getString(
                        'You must enter the name on the card.',
                      ),
                    },
                  ],
                  number: [
                    {
                      validate: required,
                      errorMessage: gettextCatalog.getString(
                        'You must enter a card number.',
                      ),
                    },
                    {
                      validate: cruPayments.card.validate.minLength,
                      errorMessage: gettextCatalog.getString(
                        'This card number must contain at least 13 digits.',
                      ),
                    },
                    {
                      validate: cruPayments.card.validate.maxLength,
                      errorMessage: gettextCatalog.getString(
                        'This card number cannot contain more than 16 digits.',
                      ),
                    },
                    {
                      validate: cruPayments.card.validate.knownType,
                      errorMessage: gettextCatalog.getString(
                        'This card type is not recognized.',
                      ),
                    },
                    {
                      validate: cruPayments.card.validate.typeLength,
                      get errorMessage() {
                        var cardNumber = currentPayment.creditCard.number;
                        var cardType = cruPayments.card.info.type(cardNumber);
                        var expectedLength =
                          cruPayments.card.info.expectedLengthForType(
                            cardNumber,
                          ) || [];
                        var expectedDigits = expectedLength.join(
                          gettextCatalog.getString(' or '),
                        );
                        return gettextCatalog.getString(
                          'This is an invalid {{cardType}} number. It should have {{expectedDigits}} digits.',
                          {
                            cardType: cardType,
                            expectedDigits: expectedDigits,
                          },
                        );
                      },
                    },
                    {
                      validate: cruPayments.card.validate.checksum,
                      errorMessage: gettextCatalog.getString(
                        'This card number is invalid. At least one digit was entered incorrectly.',
                      ),
                    },
                  ],
                  cvvNumber: [
                    {
                      validate: required,
                      errorMessage: gettextCatalog.getString(
                        'You must enter the security code.',
                      ),
                    },
                    {
                      validate: cruPayments.cvv.validate.minLength,
                      errorMessage: gettextCatalog.getString(
                        'The security code must be at least 3 digits.',
                      ),
                    },
                    {
                      validate: cruPayments.cvv.validate.maxLength,
                      errorMessage: gettextCatalog.getString(
                        'The security code cannot be more than 4 digits.',
                      ),
                    },
                    {
                      validate: function(cvv) {
                        var cardNumber = currentPayment.creditCard.number;
                        var cardType = cruPayments.card.info.type(cardNumber);
                        return cruPayments.cvv.validate.cardTypeLength(
                          cvv,
                          cardType,
                        );
                      },
                      errorMessage: gettextCatalog.getString(
                        'The security code has an invalid length.',
                      ),
                    },
                  ],
                  expirationMonth: [
                    {
                      validate: required,
                      errorMessage: gettextCatalog.getString(
                        'You must choose an expiration month.',
                      ),
                    },
                    {
                      validate: function(expirationMonth) {
                        return cruPayments.expiryDate.validate.month(
                          expirationMonth,
                          currentPayment.creditCard.expirationYear,
                        );
                      },
                      errorMessage: gettextCatalog.getString(
                        'Your credit card is expired or you selected the wrong month or year.',
                      ),
                    },
                  ],
                  expirationYear: [
                    {
                      validate: required,
                      errorMessage: gettextCatalog.getString(
                        'You must choose an expiration year.',
                      ),
                    },
                    {
                      validate: cruPayments.expiryDate.validate.year,
                      errorMessage: gettextCatalog.getString(
                        'Your credit card is expired or you selected the wrong year.',
                      ),
                    },
                  ],
                };

                // Run all of the validations
                _.forEach(validations, function(validators, field) {
                  // Validate this field, stopping on the first failed validator
                  var failedValidator = _.find(validators, function(validator) {
                    return !validator.validate(
                      currentPayment.creditCard[field],
                    );
                  });
                  if (failedValidator) {
                    paymentErrors.push(failedValidator.errorMessage);
                  }
                });

                //don't require billing address if admin payment
                if (!$scope.isAdminPayment) {
                  if (
                    !currentPayment.creditCard.billingAddress ||
                    !currentPayment.creditCard.billingCity ||
                    !currentPayment.creditCard.billingZip
                  ) {
                    paymentErrors.push(
                      'Please enter your card billing details.',
                    );
                  }
                }
                break;
              case 'OFFLINE_CREDIT_CARD':
                if (!currentPayment.offlineCreditCard.transactionId) {
                  paymentErrors.push('Please enter a transaction ID.');
                }
                break;
              case 'SCHOLARSHIP':
                if (!currentPayment.scholarship.staffEmail) {
                  paymentErrors.push(
                    'Please select a staff member to approve your scholarship.',
                  );
                }
                break;
              case 'TRANSFER':
                if (!currentPayment.transfer.accountType) {
                  paymentErrors.push('Please select an Account Type.');
                }
                if (currentPayment.transfer.accountType === 'STAFF') {
                  if (!currentPayment.transfer.accountNumber) {
                    paymentErrors.push('Please enter a Staff Account Number.');
                  }
                } else if (currentPayment.transfer.accountType === 'MINISTRY') {
                  if (
                    !currentPayment.transfer.businessUnit ||
                    !currentPayment.transfer.operatingUnit ||
                    !currentPayment.transfer.department ||
                    !currentPayment.transfer.projectId
                  ) {
                    paymentErrors.push(
                      'Please fill in all ministry transfer fields.',
                    );
                  }
                }
                break;
              case 'CHECK':
                if ($scope.isAdminPayment) {
                  if (!currentPayment.status) {
                    paymentErrors.push('Please select a check status.');
                  }
                  if (
                    !currentPayment.check.checkNumber &&
                    currentPayment.status === 'RECEIVED'
                  ) {
                    paymentErrors.push('Please enter a check number.');
                  }
                }
                break;
            }
          }
          $scope.currentPayment.errors = paymentErrors;
        },
        true,
      );
    },
  };
});
