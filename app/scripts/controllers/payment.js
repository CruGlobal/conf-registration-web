'use strict';

angular.module('confRegistrationWebApp')
  .controller('paymentCtrl', function ($scope, $http) {

    $scope.createPayment = function () {
      $http.get('/registrations/{registrationId}/payment').success(function (result) {
        console.log(result);
      });
    }
  });
