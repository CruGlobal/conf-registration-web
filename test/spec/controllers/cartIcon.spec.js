import angular from 'angular';
import 'angular-mocks';

describe('Controller: cartIconCtrl', () => {
  let scope, $rootScope, $controller, cart;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject((_$controller_, _$rootScope_, _cart_) => {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      cart = _cart_;

      scope = $rootScope.$new();
      $controller('cartIconCtrl', { $scope: scope });

      scope.$digest();
      cart.registrations = [{}, {}, {}];
      $rootScope.$broadcast('cartUpdated');
    }),
  );

  it('should set cartItemCount', () => {
    expect(scope.cartItemCount).toBe(3);
  });

  it('should handle empty cart', () => {
    cart.registrations = [];
    $rootScope.$broadcast('cartUpdated');

    scope = $rootScope.$new();
    $controller('cartIconCtrl', { $scope: scope });

    expect(scope.cartItemCount).toBe(0);
  });

  it('should update cart count when cartUpdated event is broadcast', () => {
    cart.registrations = [{}];
    $rootScope.$broadcast('cartUpdated');

    expect(scope.cartItemCount).toBe(1);
  });
});
