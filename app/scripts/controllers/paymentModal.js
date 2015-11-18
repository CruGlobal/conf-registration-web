'use strict';

angular.module('confRegistrationWebApp')
  .controller('paymentModal', function ($scope, $modalInstance, modalMessage, $http, registration, conference, permissions, permissionConstants) {
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
    var permissionRequiredMsg = 'You do not have permission to perform this action. Please contact an event administrator to request permission.';

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
        modalMessage.error('Please select a transaction type.');
        return;
      }
      if (Number($scope.newTransaction.amount) <= 0 && $scope.newTransaction.paymentType !== 'CASH') {
        modalMessage.error('Transaction amount must be a positive number.');
        return;
      }
      if ($scope.newTransaction.paymentType === 'CREDIT_CARD') {
        var validationError = ccp.validateCardNumber($scope.newTransaction.creditCard.number || '');
        if(validationError){
          modalMessage.error('Please enter a valid card number. The ' + validationError + '.');
          return;
        }
      }

      if(permissions.permissionInt < permissionConstants.UPDATE){
        if(permissions.permissionInt === permissionConstants.SCHOLARSHIP) {
          if($scope.newTransaction.paymentType !== 'SCHOLARSHIP'){
            modalMessage.error('Your permission level only allows scholarship payments to be added. Please contact an event administrator to request permission.');
            return;
          }
        }else{
          modalMessage.error(permissionRequiredMsg);
          return;
        }
      }

      if(permissions.permissionInt < permissionConstants.FULL && _.contains(['ADDITIONAL_EXPENSE', 'DISCOUNT'], $scope.newTransaction.paymentType)){
        modalMessage.error(permissionRequiredMsg);
        return;
      }

      $scope.processing = true;
      var transaction = angular.copy($scope.newTransaction);
      transaction.amount = Number(transaction.amount);
      var path = 'payments?sendEmailReceipt=' + transaction.sendEmailReceipt;
      delete transaction.sendEmailReceipt;

      if(_.contains(['ADDITIONAL_EXPENSE', 'DISCOUNT'], transaction.paymentType)) {
        path = 'expenses';
        if(transaction.paymentType === 'DISCOUNT'){
          transaction.amount = Number(transaction.amount) * -1;
        }
        delete transaction.paymentType;
      } else {
        transaction.readyToProcess = true;
      }

      if(transaction.paymentType === 'SCHOLARSHIP' && angular.isDefined(transaction.scholarship)) {
        transaction.scholarship.scholarshipStatus = 'APPROVED';
      }

      if(transaction.paymentType === 'CREDIT_CARD'){
        $http.get('payments/ccp-client-encryption-key').success(function(ccpClientEncryptionKey) {
          ccp.initialize(ccpClientEncryptionKey);
          transaction.creditCard.lastFourDigits = ccp.getAbbreviatedNumber(transaction.creditCard.number);
          transaction.creditCard.number = ccp.encrypt(transaction.creditCard.number);
          transaction.creditCard.cvvNumber = ccp.encrypt(transaction.creditCard.cvvNumber);
          postTransaction(path, transaction);
        }).error(function() {
          $scope.processing = false;
          modalMessage.error('An error occurred while requesting the ccp encryption key.');
        });
      }else{
        postTransaction(path, transaction);
      }
    };

    var postTransaction = function(path, transaction){
      $http.post(path, transaction).success(function () {
        loadPayments();
        if(path === 'expenses'){
          $scope.activeTab[2] = true;
        }else{
          $scope.activeTab[1] = true;
        }
      }).error(function (data) {
        modalMessage.error('Transaction failed. ' + data.errorMessage);
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
      if(permissions.permissionInt < permissionConstants.UPDATE){
        modalMessage.error(permissionRequiredMsg);
        return;
      }
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
      }).error(function (data) {
        modalMessage.error('Refund failed. ' + data.errorMessage);
        $scope.processing = false;
      });
    };

    $scope.cancelRefund = function () {
      delete $scope.refund;
    };

    $scope.removeExpense = function (expense) {
      if(permissions.permissionInt < permissionConstants.UPDATE){
        modalMessage.error(permissionRequiredMsg);
        return;
      }

      modalMessage.confirm({
        'title': 'Delete Expense?',
        'question': 'Are you sure you want to delete this expense?'
      }).then(function(){
        $http.delete('expenses/' + expense.id).success(function () {
          loadPayments();
        }).error(function () {
          modalMessage.error('An error occurred while deleting this expense.');
        });
      });
    };

    $scope.savePaymentEdits = function (payment) {
      if(payment.paymentType === 'SCHOLARSHIP'){
        payment.scholarship.scholarshipStatus = 'APPROVED';
      }
      $http.put('payments/' + payment.id, payment).success(function() {
        loadPayments();
        delete $scope.editPayment;
      }).error(function(){
        modalMessage.error('Payment could not be saved. Please verify all required fields are filled in correctly.');
      });
    };

    $scope.openEditPaymentRow = function (payment) {
      if(angular.isDefined($scope.editPayment) && $scope.editPayment.id === payment.id) {
        delete $scope.editPayment;
      } else {
        if(permissions.permissionInt >= permissionConstants.UPDATE || (permissions.permissionInt === permissionConstants.SCHOLARSHIP && payment.paymentType === 'SCHOLARSHIP')){
          $scope.editPayment = angular.copy(payment);
        }else{
          modalMessage.error(permissionRequiredMsg);
        }
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
      if(permissions.permissionInt >= permissionConstants.UPDATE || (permissions.permissionInt === permissionConstants.SCHOLARSHIP && payment.paymentType === 'SCHOLARSHIP')){
      }else{
        modalMessage.error(permissionRequiredMsg);
        return;
      }
      modalMessage.confirm({
        'title':'Delete payment?',
        'question': 'Are you sure you want to delete this payment?'
      }).then(function(){
        $http.delete('payments/' + payment.id, payment).success(function () {
          loadPayments();
        }).error(function () {
          modalMessage.error('An error occurred while deleting this payment.');
        });
      });
    };

    $scope.openEditExpenseRow = function (expense) {
      if(angular.isDefined($scope.editExpense) && $scope.editExpense.id === expense.id) {
        delete $scope.editExpense;
      } else {
        if(permissions.permissionInt < permissionConstants.UPDATE){
          modalMessage.error(permissionRequiredMsg);
          return;
        }

        $scope.editExpense = angular.copy(expense);
      }
    };

    $scope.allowCreditCardPayments = function () {
      var allow = false;
      _.each($scope.registration.registrants, function(registrant) {
        var registrantType = $scope.getRegistrantType(registrant.registrantTypeId);
        if(registrantType.acceptCreditCards) {
          allow = true;
        }
      });

      return allow;
    };

    //auto set new transaction amount
    $scope.setTransactionAmount = function(){
      var paymentTypes = ['CREDIT_CARD', 'OFFLINE_CREDIT_CARD', 'SCHOLARSHIP', 'TRANSFER', 'CHECK', 'CASH'];

      if($scope.registration.remainingBalance > 0 && ($scope.newTransaction.amount === 0 || $scope.newTransaction.amount === '' || $scope.newTransaction.amount === '0') && _.contains(paymentTypes, $scope.newTransaction.paymentType)){
        $scope.newTransaction.amount = $scope.registration.remainingBalance;
      }
    };

    $scope.addPromotion = function(inputCode){
      $http.post('registrations/' + registration.id + '/promotions', {code: inputCode}).success(function () {
        loadPayments();
      }).error(function (data, status) {
        modalMessage.error({
          'message': status === 404 ? 'The promo code you have entered is invalid or does not apply to this registration.' : data,
          'title': 'Invalid Code',
          'forceAction': true
        });
      });
    };

    $scope.deletePromotion = function (promoId) {
      if(permissions.permissionInt < permissionConstants.UPDATE){
        modalMessage.error(permissionRequiredMsg);
        return;
      }

      var regCopy = angular.copy($scope.registration);
      _.remove(regCopy.promotions, {id: promoId});
      $http.put('registrations/' + registration.id, regCopy).success(loadPayments).error(function () {
        modalMessage.error('An error occurred while deleting promotion.');
      });
    };

    $scope.filterUsedPromoCodes = function(p){
      var registrationPromoCodes = _.pluck($scope.registration.promotions, 'id');
      return !_.contains(registrationPromoCodes, p.id);
    }
  });
