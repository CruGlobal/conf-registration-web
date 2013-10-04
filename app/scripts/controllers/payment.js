'use strict';

angular.module('confRegistrationWebApp')
  .controller('paymentCtrl', function ($scope, $location, registration, conference, $http) {
    $scope.conference = conference;
    $scope.currentYear = new Date().getFullYear();
    $scope.payment = {};
    $scope.amount = conference.minimumDeposit;

    $scope.createPayment = function () {
      $http.post('registrations/' + registration.id + '/payment', {"registrationId": registration.id})
        .success(function (result) {
          console.log('payment created: ' + result.id);
          $scope.payment = result;

          $http.put('registrations/' + registration.id + '/payment/' + result.id, {
            "id": result.id,
            "amount": $scope.amount,
            "registrationId": registration.id,
            "cc_name_on_card": $scope.cc_name_on_card,
            "cc_expiration_month": $scope.cc_expiration_month,
            "cc_expiration_year": $scope.cc_expiration_year,
            "cc_number": $scope.cc_number
          }).success(function (result) {
              $scope.payment = result;
              if (registration.completed === false) {
                $location.path('/reviewRegistration/' + conference.id);
              } else {
              }
            });

          $http.get('registrations/' + registration.id + '/payment/' + result.id).success(function (result) {
            console.log(result);
          });
        });
    }
  });