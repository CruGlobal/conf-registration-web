'use strict';

angular.module('confRegistrationWebApp')
  .directive('ertPayment', function () {
    return {
      templateUrl: 'views/components/payment.html',
      restrict: 'A',
      scope: {
        currentPayment: '=payment',
        currentRegistration: '=registration',
        paymentMethods: '=paymentMethods',
        isAdminPayment: '=adminPayment'
      },
      controller: function ($scope, $http, cruPayments, expenseTypesConstants, gettext) {
        $scope.conference =  $scope.$parent.conference;
        $scope.expenseTypesConstants = expenseTypesConstants;
        $scope.currentYear = new Date().getFullYear();
        $scope.creditCardCountry = 'US';

        $scope.paymentMethodsViews = {
          CREDIT_CARD: 'views/paymentMethods/creditCard.html',
          OFFLINE_CREDIT_CARD: 'views/paymentMethods/creditCardOffline.html',
          CHECK: $scope.isAdminPayment ? 'views/paymentMethods/checkAdmin.html' : 'views/paymentMethods/check.html',
          TRANSFER: 'views/paymentMethods/transfer.html',
          SCHOLARSHIP: $scope.isAdminPayment ? 'views/paymentMethods/scholarshipAdmin.html' : 'views/paymentMethods/scholarship.html',
          PAY_ON_SITE: 'views/paymentMethods/payOnSite.html',
          ADDITIONAL_EXPENSE: 'views/paymentMethods/additionalExpense.html'
        };

        $scope.searchStaff = function(val) {
          return $http.get('registrations/' + $scope.currentRegistration.id + '/staffsearch', {params: {name: val}}).then(function(response){
            return response.data;
          });
        };

        $scope.selectStaff = function(item){
          $scope.currentPayment.scholarship = {
            staffApprovalName: item.firstName + ' ' + item.lastName,
            staffEmail: item.email
          };
        };

        //payment validation
        $scope.$watch('currentPayment', function(currentPayment){
          if(angular.isUndefined(currentPayment)){
            return;
          }
          currentPayment = angular.copy(currentPayment);
          if(!currentPayment.creditCard){ currentPayment.creditCard = {}; }
          if(!currentPayment.offlineCreditCard){ currentPayment.offlineCreditCard = {}; }
          if(!currentPayment.transfer){ currentPayment.transfer = {}; }
          if(!currentPayment.scholarship){ currentPayment.scholarship = {}; }
          if(!currentPayment.check){ currentPayment.check = {}; }

          //validate SCHOLARSHIP payments as TRANSFER payments when admin
          if(currentPayment.paymentType === 'SCHOLARSHIP' && $scope.isAdminPayment) {
            currentPayment.paymentType = 'TRANSFER';
            currentPayment.transfer = currentPayment.scholarship;
          }

          var paymentErrors = [];
          if(angular.isUndefined(currentPayment.paymentType)) {
            paymentErrors.push('Please select a payment method.');
          } else {
            switch (currentPayment.paymentType) {
              case 'CREDIT_CARD':
                function required (value) {
                  return Boolean(value);
                }

                var validations = {
                  nameOnCard: [
                    {
                      validate: required,
                      errorMessage: 'You must enter the name on the card.'
                    }
                  ],
                  number: [
                    {
                      validate: required,
                      errorMessage: 'You must enter a card number.'
                    }, {
                      validate: cruPayments.card.validate.minLength,
                      errorMessage: 'This card number must contain at least 13 digits.'
                    }, {
                      validate: cruPayments.card.validate.maxLength,
                      errorMessage: 'This card number cannot contain more than 16 digits.'
                    }, {
                      validate: cruPayments.card.validate.knownType,
                      errorMessage: 'This card type is not recognized.'
                    }, {
                      validate: cruPayments.card.validate.typeLength,
                      get errorMessage() {
                        var cardNumber = currentPayment.creditCard.number;
                        var cardType = cruPayments.card.info.type(cardNumber);
                        var expectedLength = cruPayments.card.info.expectedLengthForType(cardNumber) || [];
                        return 'This is an invalid ' + cardType + ' number. ' +
                               'It should have ' + expectedLength.join(' or ') + ' digits.';
                      }
                    }, {
                      validate: cruPayments.card.validate.checksum,
                      errorMessage: 'This card number is invalid. At least one digit was entered incorrectly.'
                    }
                  ],
                  cvvNumber: [
                    {
                      validate: required,
                      errorMessage: 'You must enter the security code.'
                    }, {
                      validate: cruPayments.cvv.validate.minLength,
                      errorMessage: 'The security code must be at least 3 digits.'
                    }, {
                      validate: cruPayments.cvv.validate.maxLength,
                      errorMessage: 'The security code cannot be more than 4 digits.'
                    }
                  ],
                  expirationMonth: [
                    {
                      validate: required,
                      errorMessage: 'You must choose an expiration month.'
                    }, {
                      validate: function (expirationMonth) {
                        return cruPayments.expiryDate.validate.month(expirationMonth, currentPayment.creditCard.expirationYear);
                      },
                      errorMessage: 'Your credit card is expired or you selected the wrong month or year.'
                    }
                  ],
                  expirationYear: [
                    {
                      validate: required,
                      errorMessage: 'You must choose an expiration year.'
                    }, {
                      validate: cruPayments.expiryDate.validate.year,
                      errorMessage: 'Your credit card is expired or you selected the wrong year.'
                    }
                  ]
                };

                // Run all of the validations
                _.forEach(validations, function (validators, field) {
                  // Validate this field
                  validators.forEach(function (validator) {
                    if (!validator.validate(currentPayment.creditCard[field])) {
                      paymentErrors.push(gettext(validator.errorMessage));
                    }
                  })
                });

                //don't require billing address if admin payment
                if(!$scope.isAdminPayment){
                  if(!currentPayment.creditCard.billingAddress || !currentPayment.creditCard.billingCity || !currentPayment.creditCard.billingZip){
                    paymentErrors.push('Please enter your card billing details.');
                  }
                }
                break;
              case 'OFFLINE_CREDIT_CARD':
                if(!currentPayment.offlineCreditCard.transactionId){
                  paymentErrors.push('Please enter a transaction ID.');
                }
                break;
              case 'SCHOLARSHIP':
                if(!currentPayment.scholarship.staffEmail){
                  paymentErrors.push('Please select a staff member to approve your scholarship.');
                }
                break;
              case 'TRANSFER':
                if(!currentPayment.transfer.accountType){
                  paymentErrors.push('Please select an Account Type.');
                }
                if(currentPayment.transfer.accountType === 'STAFF'){
                  if(!currentPayment.transfer.accountNumber){
                    paymentErrors.push('Please enter a Staff Account Number.');
                  }
                }else if(currentPayment.transfer.accountType === 'MINISTRY'){
                  if(!currentPayment.transfer.businessUnit || !currentPayment.transfer.operatingUnit || !currentPayment.transfer.department || !currentPayment.transfer.projectId){
                    paymentErrors.push('Please fill in all ministry transfer fields.');
                  }
                }
                break;
              case 'CHECK':
                if($scope.isAdminPayment) {
                  if(!currentPayment.status){
                    paymentErrors.push('Please select a check status.');
                  }
                  if(!currentPayment.check.checkNumber){
                    paymentErrors.push('Please enter a check number.');
                  }
                }
                break;
            }
          }
          $scope.currentPayment.errors = paymentErrors;
        }, true);
      }
    };
  });
