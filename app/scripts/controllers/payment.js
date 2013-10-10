'use strict';

angular.module('confRegistrationWebApp')
  .controller('paymentCtrl', function ($scope, $location, registration, conference, $http) {
    $scope.conference = conference;
    $scope.currentYear = new Date().getFullYear();
    $scope.payment = {};
    $scope.amount = conference.minimumDeposit;

    $scope.createPayment = function () {
      if (!$scope.creditCardNameOnCard) {
        alert('Please enter the name on your card.');
        return;
      }
      if (!$scope.creditCardNumber) {
        alert('Please enter your card number.');
        return;
      }
      if (!$scope.creditCardExpirationMonth || !$scope.creditCardExpirationYear) {
        alert('Please enter card expiration date.');
        return;
      }

      $http.post('registrations/' + registration.id + '/payment', {'registrationId': registration.id})
        .success(function (result) {
          console.log('payment created: ' + result.id);
          $scope.payment = result;

          $http.put('registrations/' + registration.id + '/payment/' + result.id, {
            'id': result.id,
            'amount': $scope.amount,
            'registrationId': registration.id,
            'creditCardNameOnCard': $scope.creditCardNameOnCard,
            'creditCardExpirationMonth': $scope.creditCardExpirationMonth,
            'creditCardExpirationYear': $scope.creditCardExpirationYear,
            'creditCardNumber': $scope.creditCardNumber
          }).success(function () {
              if (registration.completed === false) {
                $location.path('/reviewRegistration/' + conference.id);
              } else {
              }

              $http.get('registrations/' + registration.id + '/payment/' + $scope.payment.id)
                .success(function (result) {
                  console.log(result);
                });
            });
        });
    };
  });