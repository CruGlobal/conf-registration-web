'use strict';

angular.module('confRegistrationWebApp')
  .controller('errorModal', function ($scope, $modalInstance, message) {
    $scope.message = message;
    $scope.close = function () {
      $modalInstance.close('');
    };
  });
angular.module('confRegistrationWebApp')
  .controller('paymentCtrl', function ($scope, $rootScope, $location, registration, conference, $http, $modal, RegistrationCache) {
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
      $scope.amount = conference.minimumDeposit;
    }

    $scope.currentRegistration = registration;
    $scope.conference = conference;

    $scope.createPayment = function () {
      var errorModalOptions = {};
      if (!$scope.creditCardNameOnCard) {
        errorModalOptions = {
          templateUrl: 'views/errorModal.html',
          controller: 'errorModal',
          resolve: {
            message: function () {
              return 'Please enter the name on your card.';
            }
          }
        };
        $modal.open(errorModalOptions);
        return;
      }
      if (!$scope.creditCardNumber) {
        errorModalOptions = {
          templateUrl: 'views/errorModal.html',
          controller: 'errorModal',
          resolve: {
            message: function () {
              return 'Please enter your card number.';
            }
          }
        };
        $modal.open(errorModalOptions);
        return;
      }
      if (!$scope.creditCardExpirationMonth || !$scope.creditCardExpirationYear) {
        errorModalOptions = {
          templateUrl: 'views/errorModal.html',
          controller: 'errorModal',
          resolve: {
            message: function () {
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
      $rootScope.currentPayment.creditCardNameOnCard = $scope.creditCardNameOnCard;
      $rootScope.currentPayment.creditCardExpirationMonth = $scope.creditCardExpirationMonth;
      $rootScope.currentPayment.creditCardExpirationYear = $scope.creditCardExpirationYear;
      $rootScope.currentPayment.creditCardNumber = $scope.creditCardNumber;
      $rootScope.currentPayment.creditCardCVVNumber = $scope.creditCardCVVNumber;

      if (registration.completed) {
        var currentPayment = $rootScope.currentPayment;
        currentPayment.readyToProcess = true;
        $http.post('payments/', currentPayment).success(function () {
          RegistrationCache.emptyCache();
          $location.path('/register/' + conference.id);
        }).error(function () {
            var errorModalOptions = {
              templateUrl: 'views/errorModal.html',
              controller: 'errorModal',
              backdrop: 'static',
              keyboard: false,
              resolve: {
                message: function () {
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