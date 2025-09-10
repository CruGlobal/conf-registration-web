angular
  .module('confRegistrationWebApp')
  .controller('cartIconCtrl', function ($scope, cart) {
    function updateCartCount() {
      $scope.cartItemCount = cart.getRegistrationIds().length;
    }

    updateCartCount();

    $scope.$on('cartUpdated', updateCartCount);
  });
