'use strict';

angular.module('confRegistrationWebApp')
  .controller('paymentModal', function ($scope, $modalInstance, $http, registration, conference) {
    $scope.registration = registration;
    $scope.conference = conference;
    $scope.currentYear = new Date().getFullYear();
    $scope.processing = false;

    $scope.close = function () {
      $modalInstance.close($scope.registration);
    };

    $scope.getRegistrantType = function(id) {
      return _.find(conference.registrantTypes, { 'id': id });
    };

    $scope.getBlock = function (blockId) {
      var allBlocks = [];

      _.each(conference.registrationPages, function (page) {
        allBlocks = allBlocks.concat(page.blocks);
      });

      return _.find(allBlocks, {id: blockId});
    };

    $scope.newTransaction = {
      registrationId: registration.id,
      amount: registration.remainingBalance
    };

    $scope.updateCostRegistration = [];
    angular.forEach(registration.registrants, function (r) {
      $scope.updateCostRegistration[r.id] = r.calculatedTotalDue;
    });

    $scope.processTransaction = function () {
      if (_.isEmpty($scope.newTransaction.paymentType)) {
        alert('Please select a transaction type.');
        return;
      }
      if (Number($scope.newTransaction.amount) <= 0) {
        alert('Transaction amount must be a positive number.');
        return;
      }

      $scope.processing = true;

      var path = 'payments';
      if($scope.newTransaction.paymentType === 'ADDITIONAL_EXPENSE') {
        path = 'expenses';
        delete $scope.newTransaction.paymentType;
      } else {
          $scope.newTransaction.readyToProcess = true;
      }

      $http.post(path, $scope.newTransaction).success(function () {
          loadPayments();
      }).error(function () {
        alert('Transaction failed...');
        $scope.processing = false;
      });
    };

    $scope.canBeRefunded = function (payment) {
      return payment.paymentType !== 'CREDIT_CARD_REFUND' &&
        payment.paymentType !== 'REFUND' &&
        $scope.calculateRefundableAmount(payment) > 0;
    };

    $scope.calculateRefundableAmount = function (payment) {
      if(angular.isUndefined(payment)) {
        return 0;
      }
      var sum = payment.amount;
      _.each($scope.registration.pastPayments, function (prevRefund) {
        if ((prevRefund.paymentType === 'CREDIT_CARD_REFUND' || prevRefund.paymentType === 'REFUND') &&
          prevRefund.refundedPaymentId === payment.id) {
          sum -= prevRefund.amount;
        }
      });
      return sum;
    };

    $scope.isCreditCardPayment = function () {
      return $scope.paymentToRefund && $scope.paymentToRefund.paymentType === 'CREDIT_CARD';
    };

    $scope.startRefund = function (payment) {
      $scope.paymentToRefund = payment;

      if ($scope.isCreditCardPayment()) {
        $scope.refund = {
          amount: $scope.calculateRefundableAmount(payment),
          refundedPaymentId: payment.id,
          registrationId: payment.registrationId,
          paymentType: 'CREDIT_CARD_REFUND',
          creditCard: {
            lastFourDigits: payment.creditCard.lastFourDigits
          },
          readyToProcess: true
        };
      } else {
        $scope.refund = {
          amount: $scope.calculateRefundableAmount(payment),
          refundedPaymentId: payment.id,
          registrationId: payment.registrationId,
          paymentType: 'REFUND',
          readyToProcess: true
        };
      }
    };

    $scope.processRefund = function () {
      $scope.processing = true;
      $http.post('payments/', $scope.refund).success(function () {
        $http.get('registrations/' + $scope.registration.id).success(function (data) {
          //RegistrationCache.update('registrations/' + data.id, data, function () {});
          $scope.registration = data;
          $scope.processing = false;
          $scope.refund = null;
          if(angular.isDefined($scope.newTransaction)) {
            $scope.newTransaction.amount = data.remainingBalance;
          }
        });
      }).error(function () {
        alert('Refund failed...');
        $scope.processing = false;
      });
    };

    $scope.cancelRefund = function () {
      delete $scope.refund;
    };

    $scope.removeExpense = function (expense) {
      $http.delete('expenses/' + expense.id).success(function() {
        $http.get('registrations/' + $scope.registration.id).success(function (data) {
          $scope.registration = data;
        });
      }).error(function () {
        alert('Error removing expense.');
      });
    };

    $scope.saveEdits = function (payment) {

      $http.put('payments/' + payment.id, payment).success(function() {
        loadPayments();
      });

    };

    $scope.openEditPaymentRow = function (payment) {
      if(angular.isDefined($scope.editPayment))
      {
        delete $scope.editPayment;
      }
      else {
        $scope.editPayment = angular.copy(payment);

      }
    };

    var loadPayments = function() {
      $http.get('registrations/' + $scope.registration.id).success(function (data) {
        $scope.registration = data;
        $scope.processing = false;

        $scope.newTransaction = {
          registrationId: registration.id,
          amount: data.remainingBalance
        };
      });
    };

    $scope.deletePayment = function (payment) {
      $http.delete('payments/' + payment.id, payment).success(function() {
        loadPayments();
      });
    };

  });
