import template from './staffAccountNotice.html';

// Static info banner shown next to the Account Number field in the admin
// payment forms. The staff account number is looked up by email, so it only
// fills in after the admin searches for and selects a staff member.
angular
  .module('confRegistrationWebApp')
  .directive('staffAccountNotice', function () {
    return {
      templateUrl: template,
      restrict: 'E',
      scope: {
        accountType: '<',
      },
    };
  });
