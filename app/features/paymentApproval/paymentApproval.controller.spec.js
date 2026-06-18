import 'angular-mocks';

describe('Controller: paymentApproval', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let scope;

  beforeEach(
    angular.mock.inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();

      $controller('PaymentApprovalCtrl', { $scope: scope });
    }),
  );

  it('sets payment', () => {
    expect(scope.payment).toBeDefined();
  });
});
