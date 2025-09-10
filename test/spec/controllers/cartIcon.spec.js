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

      spyOn(cart, 'getRegistrationIds').and.returnValue([
        'reg1',
        'reg2',
        'reg3',
      ]);

      scope = $rootScope.$new();
      $controller('cartIconCtrl', { $scope: scope });
    }),
  );

  it('should set cartItemCount', () => {
    expect(cart.getRegistrationIds).toHaveBeenCalledWith();
    expect(scope.cartItemCount).toBe(3);
  });

  it('should handle empty cart', () => {
    cart.getRegistrationIds.and.returnValue([]);

    scope = $rootScope.$new();
    $controller('cartIconCtrl', { $scope: scope });

    expect(scope.cartItemCount).toBe(0);
  });

  it('should update cart count when cartUpdated event is broadcast', () => {
    expect(scope.cartItemCount).toBe(3);

    cart.getRegistrationIds.and.returnValue(['reg1', 'reg2']);
    $rootScope.$broadcast('cartUpdated');

    expect(scope.cartItemCount).toBe(2);
    expect(cart.getRegistrationIds).toHaveBeenCalledTimes(2);
  });
});
