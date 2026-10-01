angular
  .module('confRegistrationWebApp')
  .controller(
    'PaymentApprovalCtrl',
    function (
      $scope,
      $rootScope,
      $routeParams,
      $http,
      modalMessage,
      staffAccountService,
    ) {
      $rootScope.globalPage = {
        type: 'registration',
        mainClass: 'container front-form',
        bodyClass: 'user-registration',
        confId: 0,
        footer: false,
      };

      $scope.payment = {};
      $scope.accountNumberDisabled = false;
      $scope.staffAccountNumberError = false;
      var paymentHash = $routeParams.paymentHash;

      //retrieve payment
      $http
        .get('payments/scholarship/' + paymentHash)
        .then(function (response) {
          $scope.payment = response.data.payment;
          $scope.conference = response.data.conference;

          if (
            $scope.payment.scholarship &&
            $scope.payment.scholarship.accountType === 'STAFF'
          ) {
            fetchStaffAccountNumber();
          }
        })
        .catch(function () {
          $scope.payment = null;
          $scope.conference = null;
        });

      // The approver is logged in (requireLogin route), so fill in their own
      // staff account number from their profile and lock the field, mirroring
      // the auto-populate behavior on the registrant payment form.
      function fetchStaffAccountNumber() {
        $scope.accountNumberDisabled = false;
        $scope.staffAccountNumberError = false;

        staffAccountService
          .getProfileStaffAccountNumber()
          .then(function (accountNumber) {
            if (accountNumber) {
              $scope.payment.scholarship.accountNumber = accountNumber;
              $scope.accountNumberDisabled = true;
            } else {
              // No staff account number on the profile; the approver must
              // contact support.
              $scope.payment.scholarship.accountNumber = '';
              $scope.staffAccountNumberError = true;
            }
          });
      }

      $scope.accountTypeChanged = function () {
        if ($scope.payment.scholarship.accountType === 'STAFF') {
          fetchStaffAccountNumber();
        } else {
          $scope.payment.scholarship.accountNumber = '';
          $scope.accountNumberDisabled = false;
          $scope.staffAccountNumberError = false;
        }
      };

      $scope.updatePayment = function (status) {
        $scope.posting = true;
        var paymentObject = angular.copy($scope.payment);
        paymentObject.status = status;

        $http
          .put('payments/scholarship/' + paymentHash, paymentObject)
          .then(function () {
            $scope.payment = paymentObject;
          })
          .catch(function (response) {
            modalMessage.error(
              response.data && response.data.error
                ? response.data.error.message
                : 'An error occurred while saving the payment.',
            );
            $scope.posting = false;
          });
      };
    },
  );
