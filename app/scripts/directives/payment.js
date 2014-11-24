'use strict';

angular.module('confRegistrationWebApp')
  .directive('ertPayment', function () {
    return {
      templateUrl: 'views/components/payment.html',
      restrict: 'A',
      scope: {
        currentPayment: '=payment'
      },
      controller: function ($scope, $http) {
        $scope.conference =  $scope.$parent.conference;
        $scope.currentYear = new Date().getFullYear();

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
          if(currentPayment.paymentType === 'CREDIT_CARD'){
            if(!currentPayment.creditCard.nameOnCard){
              paymentErrors.push('Please enter the name on your card.');
            }
            if(!currentPayment.creditCard.number){
              paymentErrors.push('Please enter your card number.');
            }
            if(!currentPayment.creditCard.expirationMonth || !currentPayment.creditCard.expirationYear){
              paymentErrors.push('Please enter your card expiration date.');
            }
            if(!currentPayment.creditCard.cvvNumber){
              paymentErrors.push('Please enter your card cvv.');
            }
            if(!currentPayment.creditCard.billingAddress || !currentPayment.creditCard.billingCity || !currentPayment.creditCard.billingZip){
              paymentErrors.push('Please enter your card billing details.');
            }
          }else if(currentPayment.paymentType === 'TRANSFER'){
            if(!currentPayment.transfer.source){
              paymentErrors.push('Please enter a Chart Field or Account Number.');
            }
          }else if(currentPayment.paymentType === 'SCHOLARSHIP'){
            if(!currentPayment.scholarship.staffEmail){
              paymentErrors.push('Please select a staff member to approve your scholarship.');
            }
          }
          if(_.isEmpty(paymentErrors)){
            delete $scope.currentPayment.errors;
          }else{
            $scope.currentPayment.errors = paymentErrors;
          }
        }, true);
      }
    };
  });
