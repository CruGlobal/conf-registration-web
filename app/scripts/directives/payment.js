'use strict';

angular.module('confRegistrationWebApp')
  .directive('ertPayment', function () {
    return {
      templateUrl: 'views/components/payment.html',
      restrict: 'A',
      scope: {
        currentPayment: '=payment',
        currentRegistration: '=registration',
        paymentMethods: '=paymentMethods'
      },
      controller: function ($scope, $http) {
        $scope.conference =  $scope.$parent.conference;
        $scope.currentYear = new Date().getFullYear();
        $scope.creditCardCountry = 'US';

        $scope.paymentMethodsViews = {
          CREDIT_CARD: 'views/paymentMethods/creditCard.html',
          CHECK: 'views/paymentMethods/check.html',
          TRANSFER: 'views/paymentMethods/transfer.html',
          SCHOLARSHIP: 'views/paymentMethods/scholarship.html'
        };

        $scope.searchStaff = function(val) {
          return $http.get('staffsearch/' + encodeURIComponent(val)).then(function(response){
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
          var paymentErrors = [];
          if(angular.isUndefined(currentPayment.paymentType)){
            paymentErrors.push('Please select a payment method.');
          }else if(currentPayment.paymentType === 'CREDIT_CARD'){
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
            if(!currentPayment.creditCard.billingAddress || !currentPayment.creditCard.billingCity || !currentPayment.creditCard.billingZip){
              paymentErrors.push('Please enter your card billing details.');
            }
          }else if(currentPayment.paymentType === 'TRANSFER'){
            if(!currentPayment.transfer.accountType){
              paymentErrors.push('Please select an Account Type.');
            }
            if(currentPayment.transfer.accountType === 'STAFF'){
              if(!currentPayment.transfer.accountNumber){
                paymentErrors.push('Please enter a Staff Account Number.');
              }
            }else if(currentPayment.transfer.accountType === 'MINISTRY'){
              if(!currentPayment.transfer.businessUnit || !currentPayment.transfer.operatingUnit || !currentPayment.transfer.department || !currentPayment.transfer.projectId){
                paymentErrors.push('Please fill in all account transfer fields.');
              }
            }
          }else if(currentPayment.paymentType === 'SCHOLARSHIP'){
            if(!currentPayment.scholarship.staffEmail){
              paymentErrors.push('Please select a staff member to approve your scholarship.');
            }
          }
          if(_.isEmpty(paymentErrors)){
            $scope.currentPayment.errors = [];
          }else{
            $scope.currentPayment.errors = paymentErrors;
          }
        }, true);
      }
    };
  });
