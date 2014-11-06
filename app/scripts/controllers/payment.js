'use strict';

angular.module('confRegistrationWebApp')
  .controller('paymentCtrl', function ($scope, $rootScope, $location, registration, conference, $http, $modal, RegistrationCache) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'container front-form',
      bodyClass: 'frontend',
      title: conference.name,
      confId: conference.id,
      footer: false
    };

    var paymentType;
    if(conference.acceptCreditCards){
      paymentType = 'CREDIT_CARD';
    }else if(conference.acceptTransfers){
      paymentType = 'TRANSFER';
    }

    $scope.currentPayment = {
      amount: registration.remainingBalance,
      paymentType: paymentType,
      creditCard: {},
      transfer: {}
    };

    $scope.paymentButtonValue = 'Process Payment';
    $scope.currentRegistration = registration;
    $scope.conference = conference;

    $scope.cancel = function(){
      $location.path('/register/' + conference.id);
    };

    $scope.createPayment = function () {
      var errorMsg;
      if($scope.currentPayment.paymentType === 'CREDIT_CARD'){
        if(!$scope.currentPayment.creditCard.billingAddress || !$scope.currentPayment.creditCard.billingCity || !$scope.currentPayment.creditCard.billingZip){
          errorMsg = 'Please enter card billing details.';
        }
        if(!$scope.currentPayment.creditCard.number){
          errorMsg = 'Please enter your card number.';
        }
        if(!$scope.currentPayment.creditCard.cvvNumber){
          errorMsg = 'Please enter card cvv.';
        }
        if(!$scope.currentPayment.creditCard.expirationMonth || !$scope.currentPayment.creditCard.expirationYear){
          errorMsg = 'Please enter card expiration date.';
        }
        if(!$scope.currentPayment.creditCard.nameOnCard){
          errorMsg = 'Please enter the name on your card.';
        }
      }else if($scope.currentPayment.paymentType === 'TRANSFER'){
        if(!$scope.currentPayment.transfer.source){
          errorMsg = 'Please enter a Chart Field or Account Number.';
        }
      }


      if (errorMsg) {
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return errorMsg;
            }
          }
        });
        return;
      }
      $scope.paymentButtonValue = 'Processing...';
      var currentPayment = angular.copy($scope.currentPayment);
      currentPayment.readyToProcess = true;
      currentPayment.registrationId =  registration.id;

      $http.post('payments/', currentPayment).success(function () {
        RegistrationCache.emptyCache();
        $location.path('/register/' + conference.id);
      }).error(function () {
        $scope.paymentButtonValue = 'Process Payment';
        var errorModalOptions = {
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return 'Your payment was declined, please verify and re-enter your details.';
            }
          }
        };
        $modal.open(errorModalOptions);
      });
    };
  });