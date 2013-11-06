'use strict';

angular.module('confRegistrationWebApp')
  .controller('errorModal', function ($scope, $modalInstance, message) {
    $scope.message = message;
    $scope.close = function () {
      $modalInstance.close('');
    };
  });
angular.module('confRegistrationWebApp')
  .controller('paymentCtrl', function ($scope, $rootScope, $location, registration, conference, $http, $modal, Model) {
    $scope.currentYear = new Date().getFullYear();

    if (registration.completed) {
      //$scope.amount = 50;
    } else {
      if (conference.earlyRegistrationOpen) {
        conference.conferenceCost = (conference.conferenceCost - conference.earlyRegistrationAmount);
      }
      $scope.amount = conference.minimumDeposit;
    }

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

      //console.log(registration);

      if (registration.completed) {
        registration.currentPayment.readyToProcess = true;
        Model.update('/registrations/' + registration.id, registration, function (result) {
          console.log(result.status);
        });
      } else {
        //registration.currentPayment.readyToProcess = false;
        //Model.update('/registrations/' + registration.id, registration, function () {
          $location.path('/reviewRegistration/' + conference.id);
        //});
      }
    };
  });