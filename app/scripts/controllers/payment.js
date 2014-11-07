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
    }else if(conference.acceptScholarships){
      paymentType = 'SCHOLARSHIP';
    }

    $scope.currentPayment = {
      amount: registration.remainingBalance,
      paymentType: paymentType,
      creditCard: {},
      transfer: {},
      scholarship: {}
    };

    $scope.paymentButtonValue = 'Process Payment';
    $scope.currentRegistration = registration;
    $scope.conference = conference;

    $scope.cancel = function(){
      $location.path('/register/' + conference.id);
    };

    $scope.createPayment = function () {
      if ($scope.currentPayment.errors) {
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return $scope.currentPayment.errors;
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