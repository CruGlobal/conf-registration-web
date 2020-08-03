import 'angular-mocks';

describe('Controller: paymentApproval', function() {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(function($controller) {
      $controller('PaymentApprovalCtrl', {});
    }),
  );
});
