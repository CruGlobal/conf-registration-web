angular
  .module('confRegistrationWebApp')
  .controller('paymentModal', function(
    $scope,
    $uibModalInstance,
    modalMessage,
    $http,
    registration,
    conference,
    payment,
    permissions,
    permissionConstants,
    expenseTypesConstants,
  ) {
    $scope.registration = registration;
    $scope.conference = conference;
    $scope.expenseTypesConstants = expenseTypesConstants;
    $scope.processing = false;
    $scope.activeTab = {};
    $scope.newTransaction = {
      registrationId: registration.id,
      amount: 0,
      sendEmailReceipt: false,
    };
    var permissionRequiredMsg =
      'You do not have permission to perform this action. Please contact an event administrator to request permission.';

    $scope.getRegistrantType = function(id) {
      return _.find(conference.registrantTypes, { id: id });
    };

    $scope.getBlock = function(blockId) {
      var allBlocks = [];
      _.each(conference.registrationPages, function(page) {
        allBlocks = allBlocks.concat(page.blocks);
      });
      return _.find(allBlocks, { id: blockId });
    };

    $scope.processTransaction = function() {
      if (_.isEmpty($scope.newTransaction.paymentType)) {
        modalMessage.error('Please select a transaction type.');
        return;
      }
      if (Number($scope.newTransaction.amount) <= 0) {
        $scope.newTransaction.errors.unshift(
          'Transaction amount must be a positive number.',
        );
      }

      if (!_.isEmpty($scope.newTransaction.errors)) {
        modalMessage.error({
          title: 'Please correct the following errors:',
          message: $scope.newTransaction.errors,
        });
        return;
      }

      if (permissions.permissionInt < permissionConstants.CHECK_IN) {
        if (permissions.permissionInt === permissionConstants.SCHOLARSHIP) {
          if ($scope.newTransaction.paymentType !== 'SCHOLARSHIP') {
            modalMessage.error(
              'Your permission level only allows scholarship payments to be added. Please contact an event administrator to request permission.',
            );
            return;
          }
        } else {
          modalMessage.error(permissionRequiredMsg);
          return;
        }
      }

      if (
        permissions.permissionInt < permissionConstants.FULL &&
        _.includes(
          ['ADDITIONAL_EXPENSE', 'DISCOUNT'],
          $scope.newTransaction.paymentType,
        )
      ) {
        modalMessage.error(permissionRequiredMsg);
        return;
      }

      var transaction = angular.copy($scope.newTransaction);
      delete transaction.errors;
      transaction.amount = Number(transaction.amount);
      var path = 'payments?sendEmailReceipt=' + transaction.sendEmailReceipt;
      delete transaction.sendEmailReceipt;

      if (
        _.includes(['ADDITIONAL_EXPENSE', 'DISCOUNT'], transaction.paymentType)
      ) {
        if (!transaction.description) {
          modalMessage.error('Please enter a description.');
          return;
        }

        path = 'expenses';
        if (transaction.paymentType === 'DISCOUNT') {
          transaction.amount = Number(transaction.amount) * -1;
        }
        delete transaction.paymentType;
      }

      if (transaction.paymentType === 'SCHOLARSHIP') {
        transaction.status = 'APPROVED';
      }

      $scope.processing = true;
      if (transaction.paymentType === 'CREDIT_CARD') {
        payment
          .tokenizeCreditCardPayment(conference, transaction)
          .then(function() {
            postTransaction(path, transaction);
          })
          .catch(function() {
            $scope.processing = false;
            modalMessage.error(
              'An error occurred while requesting the encryption key.',
            );
          });
      } else {
        delete transaction.creditCard;
        postTransaction(path, transaction);
      }
    };

    function postTransaction(path, transaction) {
      $http
        .post(path, transaction)
        .then(function() {
          loadPayments();
          if (path === 'expenses') {
            $scope.activeTab[2] = true;
          } else {
            $scope.activeTab[1] = true;
          }
        })
        .catch(function(response) {
          modalMessage.error(
            response.data && response.data.error
              ? response.data.error.message
              : 'Transaction failed.',
          );
          $scope.processing = false;
        });
    }

    $scope.canEditPayment = payment => {
      if (payment.reported) {
        return (
          payment.paymentType === 'SCHOLARSHIP' ||
          payment.paymentType === 'TRANSFER'
        );
      } else {
        return true;
      }
    };

    $scope.canBeRefunded = function(payment) {
      return (
        payment.paymentType !== 'REFUND' &&
        payment.paymentType !== 'TRANSFER' &&
        payment.paymentType !== 'SCHOLARSHIP' &&
        $scope.calculateRefundableAmount(payment) > 0
      );
    };

    $scope.calculateRefundableAmount = function(payment) {
      if (angular.isUndefined(payment)) {
        return 0;
      }
      var sum = payment.amount;
      _.each($scope.registration.pastPayments, function(prevRefund) {
        if (
          prevRefund.paymentType === 'REFUND' &&
          prevRefund.refundedPaymentId === payment.id
        ) {
          sum -= prevRefund.amount;
        }
      });
      return sum;
    };

    $scope.startRefund = function(payment) {
      if (permissions.permissionInt < permissionConstants.CHECK_IN) {
        modalMessage.error(permissionRequiredMsg);
        return;
      }
      $scope.paymentToRefund = payment;

      var refundAmount = $scope.calculateRefundableAmount(payment);

      $scope.refund = {
        amount: refundAmount,
        refundedPaymentId: payment.id,
        registrationId: payment.registrationId,
        paymentType: 'REFUND',
        refundChannel: payment.paymentType,
      };
    };

    $scope.processRefund = function() {
      if (!$scope.refund.refundChannel) {
        modalMessage.error('Please select a refund method.');
        return;
      }

      $scope.processing = true;
      $http
        .post('payments/', $scope.refund)
        .then(function() {
          $scope.refund = null;
          loadPayments();
        })
        .catch(function(response) {
          modalMessage.error(
            response.data && response.data.error
              ? response.data.error.message
              : 'Refund failed.',
          );
        })
        .finally(function() {
          $scope.processing = false;
        });
    };

    $scope.cancelRefund = function() {
      delete $scope.refund;
    };

    $scope.removeExpense = function(expense) {
      if (permissions.permissionInt < permissionConstants.UPDATE) {
        modalMessage.error(permissionRequiredMsg);
        return;
      }

      modalMessage
        .confirm({
          title: 'Delete Expense?',
          question: 'Are you sure you want to delete this expense?',
        })
        .then(function() {
          $http
            .delete('expenses/' + expense.id)
            .then(function() {
              loadPayments();
            })
            .catch(function(response) {
              modalMessage.error(
                response.data && response.data.error
                  ? response.data.error.message
                  : 'An error occurred while deleting this expense.',
              );
            });
        });
    };

    $scope.savePaymentEdits = function(payment) {
      if (payment.paymentType === 'SCHOLARSHIP') {
        payment.status = 'APPROVED';
      }
      if (payment.paymentType === 'CHECK') {
        payment.status = 'RECEIVED';
        if (!payment.check.checkNumber) {
          modalMessage.error('Please enter a check number.');
          return;
        }
      }
      if (
        payment.paymentType === 'TRANSFER' &&
        payment.transfer.accountType === 'NON_US_STAFF'
      ) {
        if (
          !payment.transfer.operatingUnit ||
          !payment.transfer.accountNumber
        ) {
          modalMessage.error(
            'Please fill in Operating Unit and Account Number fields.',
          );
          return;
        }
      }

      $http
        .put('payments/' + payment.id, payment)
        .then(function() {
          loadPayments();
          delete $scope.editPayment;
        })
        .catch(function(response) {
          modalMessage.error(
            response.data && response.data.error
              ? response.data.error.message
              : 'Payment could not be saved.',
          );
        });
    };

    $scope.openEditPaymentRow = function(payment) {
      if (
        angular.isDefined($scope.editPayment) &&
        $scope.editPayment.id === payment.id
      ) {
        delete $scope.editPayment;
      } else {
        if (
          permissions.permissionInt >= permissionConstants.CHECK_IN ||
          (permissions.permissionInt === permissionConstants.SCHOLARSHIP &&
            payment.paymentType === 'SCHOLARSHIP')
        ) {
          $scope.editPayment = angular.copy(payment);
        } else {
          modalMessage.error(permissionRequiredMsg);
        }
      }
    };

    $scope.saveExpenseEdits = function(expense) {
      $http
        .put('expenses/' + expense.id, expense)
        .then(function() {
          loadPayments();
          delete $scope.editExpense;
        })
        .catch(function(response) {
          modalMessage.error(
            response.data && response.data.error
              ? response.data.error.message
              : 'Expense could not be saved.',
          );
        });
    };

    function loadPayments() {
      $http
        .get('registrations/' + $scope.registration.id)
        .then(function(response) {
          $scope.registration = response.data;
          $scope.processing = false;

          $scope.newTransaction = {
            registrationId: registration.id,
            amount: 0,
            sendEmailReceipt: false,
          };
        });
    }

    $scope.deletePayment = function(payment) {
      if (permissions.permissionInt < permissionConstants.CHECK_IN) {
        modalMessage.error(permissionRequiredMsg);
        return;
      }
      modalMessage
        .confirm({
          title: 'Delete payment?',
          question: 'Are you sure you want to delete this payment?',
        })
        .then(function() {
          $http
            .delete('payments/' + payment.id, payment)
            .then(function() {
              loadPayments();
            })
            .catch(function(response) {
              modalMessage.error(
                response.data && response.data.error
                  ? response.data.error.message
                  : 'An error occurred while deleting this payment.',
              );
            });
        });
    };

    $scope.openEditExpenseRow = function(expense) {
      if (
        angular.isDefined($scope.editExpense) &&
        $scope.editExpense.id === expense.id
      ) {
        delete $scope.editExpense;
      } else {
        if (permissions.permissionInt < permissionConstants.FULL) {
          modalMessage.error(permissionRequiredMsg);
          return;
        }

        $scope.editExpense = angular.copy(expense);
      }
    };

    //auto set new transaction amount
    $scope.setTransactionAmount = function() {
      var paymentTypes = [
        'CREDIT_CARD',
        'OFFLINE_CREDIT_CARD',
        'SCHOLARSHIP',
        'TRANSFER',
        'CHECK',
        'CASH',
      ];

      if (
        $scope.registration.remainingBalance > 0 &&
        ($scope.newTransaction.amount === 0 ||
          $scope.newTransaction.amount === '' ||
          $scope.newTransaction.amount === '0') &&
        _.includes(paymentTypes, $scope.newTransaction.paymentType)
      ) {
        $scope.newTransaction.amount = $scope.registration.remainingBalance;
      }
    };

    $scope.addPromotion = function(inputCode) {
      $http
        .post('registrations/' + registration.id + '/promotions', {
          code: inputCode,
        })
        .then(function() {
          loadPayments();
        })
        .catch(function(response) {
          var msg =
            response.data && response.data.error
              ? response.data.error.message
              : 'Promo code could not be added.';
          modalMessage.error({
            message:
              response.status === 404
                ? 'The promo code you have entered is invalid or does not apply to this registration.'
                : msg,
            title: 'Invalid Code',
            forceAction: true,
          });
        });
    };

    $scope.deletePromotion = function(promoId) {
      if (permissions.permissionInt < permissionConstants.UPDATE) {
        modalMessage.error(permissionRequiredMsg);
        return;
      }

      var regCopy = angular.copy($scope.registration);
      _.remove(regCopy.promotions, { id: promoId });
      $http
        .put('registrations/' + registration.id, regCopy)
        .then(loadPayments)
        .catch(function(response) {
          modalMessage.error(
            response.data && response.data.error
              ? response.data.error.message
              : 'An error occurred while deleting promotion.',
          );
        });
    };

    $scope.filterUsedPromoCodes = function(p) {
      var registrationPromoCodes = _.map($scope.registration.promotions, 'id');
      return !_.includes(registrationPromoCodes, p.id);
    };

    // Disable editing all other fields if payment has been reported and the paymentType is either SCHOLARSHIP or TRANSFER
    $scope.disableEditingFieldsForReportedPayments = payment =>
      payment.reported &&
      (payment.paymentType === 'SCHOLARSHIP' ||
        payment.paymentType === 'TRANSFER');
  });
