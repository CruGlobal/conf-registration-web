import template from './staffAccountSearch.html';

angular
  .module('confRegistrationWebApp')
  .directive('staffAccountSearch', function () {
    return {
      templateUrl: template,
      restrict: 'E',
      scope: {
        payment: '=',
        registrationId: '=',
        conferenceId: '=',
        disabled: '<',
      },
      controller: function ($scope, staffAccountService) {
        // The input shows the staff member's designation number, which staff
        // recognize, while payment.accountNumber keeps the staff account
        // number that the API expects.
        $scope.search = { text: $scope.payment.accountNumber || '' };

        $scope.searchStaff = function (name) {
          return staffAccountService.searchStaff(name, $scope.registrationId);
        };

        // Allow admins to type an account number directly
        $scope.searchTextChanged = function () {
          $scope.payment.accountNumber = $scope.search.text;
        };

        $scope.selectStaffAccountNumber = function (item) {
          $scope.staffAccountLookupMessage = null;
          $scope.payment.accountNumber = '';
          $scope.search.text = '';
          staffAccountService
            .staffAccountNumberLookup(item.email, $scope.conferenceId)
            .then(function (result) {
              $scope.payment.accountNumber = result.accountNumber;
              $scope.search.text =
                result.designationNumber || result.accountNumber;
              $scope.staffAccountLookupMessage = result.message;
            });
        };
      },
    };
  });
