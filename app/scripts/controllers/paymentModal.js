'use strict';

angular.module('confRegistrationWebApp')
  .controller('paymentModal', function ($scope, $modalInstance, $http, data, RegistrationCache) {
    $scope.registration = data;

    $scope.currentYear = new Date().getFullYear();

    $scope.close = function () {
      $modalInstance.close($scope.registration);
    };

    $scope.newPayment = {
      registrationId: $scope.registration.id
    };

    $scope.processPayment = function () {
      $scope.newPayment.readyToProcess = true;
      $http.post('payments/', $scope.newPayment).success(function () {
        $http.get('registrations/' + $scope.registration.id).success(function (data) {
          RegistrationCache.update('registrations/' + data.id, data, function () {});
          $scope.registration = data;
        });
        delete $scope.newPayment;
      }).error(function () {
        alert('payment failed...');
      });
    };

    $scope.canBeRefunded = function (payment) {
      var sum = 0;
      _.each($scope.registration.pastPayments, function (prevRefund) {
        if (prevRefund.paymentType === 'CREDIT_CARD_REFUND' && prevRefund.refundedPaymentId === payment.id) {
          sum += prevRefund.amount;
        }
      });
      return payment.paymentType === 'CREDIT_CARD' && sum < payment.amount;
    };

    $scope.refund = function (payment) {
      var refund = {
        amount: payment.amount,
        refundedPaymentId: payment.id,
        registrationId: payment.registrationId,
        paymentType: 'CREDIT_CARD_REFUND',
        creditCardLastFourDigits: payment.creditCardLastFourDigits,
        readyToProcess: true
      };

      $http.post('payments/', refund).success(function () {
        $http.get('registrations/' + $scope.registration.id).success(function (data) {
          RegistrationCache.update('registrations/' + data.id, data, function () {});
          $scope.registration = data;
        });
      }).error(function () {
        alert('refund failed...');
      });
    };

    $scope.updateCost = function () {
      $scope.registration.totalDue = $scope.updateCost.newTotal;
      RegistrationCache.update('registrations/' + $scope.registration.id, $scope.registration, function () {
        $scope.updateCost.show = false;
      }, function () {
        alert('error updating total cost');
      });
    };
  });