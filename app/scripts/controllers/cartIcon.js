angular
  .module('confRegistrationWebApp')
  .controller('cartIconCtrl', function ($scope, cart) {
    function updateCartCount() {
      $scope.cartItemCount = cart.registrations.length;
    }

    updateCartCount();

    $scope.$on('cartUpdated', updateCartCount);
  });
