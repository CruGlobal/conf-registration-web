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

    $scope.currentYear = new Date().getFullYear();

    if (registration.completed) {
      $scope.paymentButtonValue = 'Process Payment';
      $scope.amount = registration.remainingBalance;
    } else {
      $scope.paymentButtonValue = 'Continue';
    }

    $scope.currentRegistration = registration;
    $scope.conference = conference;

    $scope.cancel = function(){
      if (registration.completed) {
        $location.path('/register/' + conference.id);
      } else {
        $location.path('/reviewRegistration/' + conference.id);
      }
    };

    $scope.createPayment = function () {
      var errorModalOptions = {};
      if (!$scope.creditCardNameOnCard) {
        errorModalOptions = {
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return 'Please enter the name on your card.';
            }
          }
        };
        $modal.open(errorModalOptions);
        return;
      }
      if (!$scope.creditCardNumber) {
        errorModalOptions = {
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return 'Please enter your card number.';
            }
          }
        };
        $modal.open(errorModalOptions);
        return;
      }
      if (!$scope.creditCardExpirationMonth || !$scope.creditCardExpirationYear) {
        errorModalOptions = {
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return 'Please enter card expiration date.';
            }
          }
        };
        $modal.open(errorModalOptions);
        return;
      }

      if (!$scope.creditCardBillingAddress || !$scope.creditCardBillingCity || !$scope.creditCardBillingState || !$scope.creditCardBillingZip) {
        errorModalOptions = {
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return 'Please enter card billing details.';
            }
          }
        };
          $modal.open(errorModalOptions);
          return;
        }
      $rootScope.currentPayment = {
        amount: $scope.amount,
        paymentType: 'CREDIT_CARD',
        creditCard: {
          nameOnCard: $scope.creditCardNameOnCard,
          expirationMonth: $scope.creditCardExpirationMonth,
          expirationYear:  $scope.creditCardExpirationYear,
          number: $scope.creditCardNumber,
          cvvNumber: $scope.creditCardCVVNumber,
          billingAddress: $scope.creditCardBillingAddress,
          billingCity: $scope.creditCardBillingCity,
          billingState: $scope.creditCardBillingState,
          billingZip: $scope.creditCardBillingZip
        }
      };

      if (registration.completed) {
        var currentPayment = angular.copy($rootScope.currentPayment);
        currentPayment.readyToProcess = true;
        currentPayment.registrationId =  registration.id;

        $http.post('payments/', currentPayment).success(function () {
          RegistrationCache.emptyCache();
          delete $rootScope.currentPayment;
          $location.path('/register/' + conference.id);
        }).error(function () {
            var errorModalOptions = {
              templateUrl: 'views/modals/errorModal.html',
              controller: 'genericModal',
              backdrop: 'static',
              keyboard: false,
              resolve: {
                data: function () {
                  return 'Your card was declined, please verify and re-enter your details or use a different card.';
                }
              }
            };
            $modal.open(errorModalOptions);
          });
      } else {
        $location.path('/reviewRegistration/' + conference.id);
      }
    };
  });