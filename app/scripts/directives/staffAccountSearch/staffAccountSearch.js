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
        $scope.searchStaff = function (name) {
          return staffAccountService.searchStaff(name, $scope.registrationId);
        };

        $scope.selectStaffAccountNumber = function (item) {
          $scope.staffAccountLookupMessage = null;
          $scope.payment.accountNumber = '';
          staffAccountService
            .staffAccountNumberLookup(item.email, $scope.conferenceId)
            .then(function (result) {
              $scope.payment.accountNumber = result.accountNumber;
              $scope.staffAccountLookupMessage = result.message;
            });
        };
      },
    };
  });
