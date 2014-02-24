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

        $scope.newPayment = {
          registrationId: $scope.registration.id
        };

      }).error(function () {
        alert('payment failed...');
      });
    };

    $scope.canBeRefunded = function (payment) {
      var sum = 0;
      _.each($scope.registration.pastPayments, function (prevRefund) {
        if ((prevRefund.paymentType === 'CREDIT_CARD_REFUND' || prevRefund.paymentType === 'REFUND') &&
          prevRefund.refundedPaymentId === payment.id) {
          sum += prevRefund.amount;
        }
      });
      return payment.paymentType !== 'CREDIT_CARD_REFUND' &&
        payment.paymentType !== 'REFUND' &&
        sum < payment.amount;
    };

    $scope.refund = function (payment) {
      var refund;
      if (payment.paymentType === 'CREDIT_CARD') {
        refund = {
          amount: payment.amount,
          refundedPaymentId: payment.id,
          registrationId: payment.registrationId,
          paymentType: 'CREDIT_CARD_REFUND',
          creditCard: {
            lastFourDigits: payment.creditCard.lastFourDigits
          },
          readyToProcess: true
        };
      } else {
        refund = {
          amount: payment.amount,
          refundedPaymentId: payment.id,
          registrationId: payment.registrationId,
          paymentType: 'REFUND',
          readyToProcess: true
        };
      }

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