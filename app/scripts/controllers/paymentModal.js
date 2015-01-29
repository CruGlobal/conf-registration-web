'use strict';

angular.module('confRegistrationWebApp')
  .controller('paymentModal', function ($scope, $modalInstance, $http, registration, conference) {
    $scope.registration = registration;
    $scope.conference = conference;
    $scope.currentYear = new Date().getFullYear();
    $scope.processing = false;
    $scope.activeTab = {};
    $scope.newTransaction = {
      registrationId: registration.id,
      amount: 0,
      sendEmailReceipt: false
    };

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
      var path = 'payments?sendEmailReceipt=' + $scope.newTransaction.sendEmailReceipt;
      delete $scope.newTransaction.sendEmailReceipt;
      if($scope.newTransaction.paymentType === 'ADDITIONAL_EXPENSE') {
        path = 'expenses';
        delete $scope.newTransaction.paymentType;
      } else {
        $scope.newTransaction.readyToProcess = true;
      }

      $http.post(path, $scope.newTransaction).success(function () {
        loadPayments();
        if(path === 'expenses'){
          $scope.activeTab[2] = true;
        }else{
          $scope.activeTab[1] = true;
        }
      }).error(function () {
        alert('Transaction failed.');
        $scope.processing = false;
      });
    };

    $scope.canBeRefunded = function (payment) {
      return payment.paymentType !== 'CREDIT_CARD_REFUND' &&
        payment.paymentType !== 'REFUND' &&
        payment.paymentType !== 'TRANSFER' &&
        payment.paymentType !== 'SCHOLARSHIP' &&
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
          $scope.registration = data;
          $scope.processing = false;
          $scope.refund = null;
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
      if(confirm('Are you sure you want to delete this expense?')) {
        $http.delete('expenses/' + expense.id).success(function () {
          loadPayments();
        }).error(function () {
          alert('An error occurred while deleting this expense.');
        });
      }
    };

    $scope.savePaymentEdits = function (payment) {
      $http.put('payments/' + payment.id, payment).success(function() {
        loadPayments();
        delete $scope.editPayment;
      });
    };

    $scope.openEditPaymentRow = function (payment) {
      if(angular.isDefined($scope.editPayment) && $scope.editPayment.id === payment.id) {
        delete $scope.editPayment;
      } else {
        $scope.editPayment = angular.copy(payment);
      }
    };

    $scope.saveExpenseEdits = function (expense) {
      $http.put('expenses/' + expense.id, expense).success(function() {
        loadPayments();
        delete $scope.editExpense;
      });
    };

    var loadPayments = function() {
      $http.get('registrations/' + $scope.registration.id).success(function (data) {
        $scope.registration = data;
        $scope.processing = false;

        $scope.newTransaction = {
          registrationId: registration.id,
          amount: 0,
          sendEmailReceipt: false
        };
      });
    };

    $scope.deletePayment = function (payment) {
      if(confirm('Are you sure you want to delete this payment?')) {
        $http.delete('payments/' + payment.id, payment).success(function () {
          loadPayments();
        }).error(function () {
          alert('An error occurred while deleting this payment.');
        });
      }
    };

    $scope.openEditExpenseRow = function (expense) {
      if(angular.isDefined($scope.editExpense) && $scope.editExpense.id === expense.id) {
        delete $scope.editExpense;
      } else {
        $scope.editExpense = angular.copy(expense);
      }
    };
  });
