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
      controller: function ($scope, $http) {
        $scope.conference =  $scope.$parent.conference;
        $scope.currentYear = new Date().getFullYear();
        $scope.creditCardCountry = 'US';

        $scope.paymentMethodsViews = {
          CREDIT_CARD: 'views/paymentMethods/creditCard.html',
          OFFLINE_CREDIT_CARD: 'views/paymentMethods/creditCardOffline.html',
          CHECK: $scope.isAdminPayment ? 'views/paymentMethods/checkAdmin.html' : 'views/paymentMethods/check.html',
          TRANSFER: 'views/paymentMethods/transfer.html',
          SCHOLARSHIP: $scope.isAdminPayment ? 'views/paymentMethods/scholarshipAdmin.html' : 'views/paymentMethods/scholarship.html',
          PAY_ON_SITE: 'views/paymentMethods/payOnSite.html'
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
                if(!currentPayment.creditCard.nameOnCard){
                  paymentErrors.push('Please enter the name on your card.');
                }
                var validationError = ccp.validateCardNumber(currentPayment.creditCard.number || '');
                if(validationError){
                  paymentErrors.push('Please enter a valid card number. The ' + validationError + '.');
                }
                if(!currentPayment.creditCard.expirationMonth || !currentPayment.creditCard.expirationYear){
                  paymentErrors.push('Please enter your card expiration date.');
                }
                validationError = ccp.validateCardSecurityCode(currentPayment.creditCard.cvvNumber || '');
                if(validationError){
                  paymentErrors.push('Please enter a valid card security code. The ' + validationError + '.');
                }

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
