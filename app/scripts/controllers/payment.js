'use strict';

angular.module('confRegistrationWebApp')
  .controller('paymentCtrl', function ($scope, $rootScope, $location, registration, conference, $http, $modal, RegistrationCache) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'front-form',
      bodyClass: 'frontend',
      title: conference.name,
      confId: conference.id,
      footer: false
    };

    $scope.currentYear = new Date().getFullYear();

    if (registration.completed) {
      registration.remainingBalance = registration.totalDue;
      registration.pastPayments.forEach(function (payment) {
        registration.remainingBalance -= payment.amount;
      });
      $scope.amount = registration.remainingBalance;
      conference.conferenceCost = $scope.amount;
    } else {
      if (conference.earlyRegistrationOpen) {
        conference.conferenceCost = (conference.conferenceCost - conference.earlyRegistrationAmount);
      } else {
        conference.conferenceCost = conference.conferenceCost;
      }
      $rootScope.totalDue = conference.conferenceCost;
      if (!_.isEmpty(conference.minimumDeposit) && !_.isNull(conference.minimumDeposit)) {
        $scope.amount = conference.minimumDeposit;
      } else {
        conference.minimumDeposit = conference.conferenceCost;
        $scope.amount = conference.conferenceCost;
      }
    }

    $scope.currentRegistration = registration;
    $scope.conference = conference;

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

      $rootScope.currentPayment = {};
      $rootScope.currentPayment.amount = $scope.amount;
      $rootScope.currentPayment.registrationId = registration.id;
      $rootScope.currentPayment.creditCard = {};
      $rootScope.currentPayment.creditCard.nameOnCard = $scope.creditCardNameOnCard;
      $rootScope.currentPayment.creditCard.expirationMonth = $scope.creditCardExpirationMonth;
      $rootScope.currentPayment.creditCard.expirationYear = $scope.creditCardExpirationYear;
      $rootScope.currentPayment.creditCard.number = $scope.creditCardNumber;
      $rootScope.currentPayment.creditCard.cvvNumber = $scope.creditCardCVVNumber;
      $rootScope.currentPayment.paymentType = 'CREDIT_CARD';

      if (registration.completed) {
        var currentPayment = $rootScope.currentPayment;
        currentPayment.readyToProcess = true;
        $http.post('payments/', currentPayment).success(function () {
          RegistrationCache.emptyCache();
          $location.path('/register/' + conference.id);
        }).error(function () {
            var errorModalOptions = {
              templateUrl: 'views/errorModal.html',
              controller: 'genericModal',
              backdrop: 'static',
              keyboard: false,
              resolve: {
                data: function () {
                  return 'Your card was declined, please verify and re-enter your details or use a different card.';
                }
              }
            };
            $modal.open(errorModalOptions).result.then(function () {
            });
          });
      } else {
        $location.path('/reviewRegistration/' + conference.id);
      }
    };
  });