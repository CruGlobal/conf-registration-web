angular
  .module('confRegistrationWebApp')
  .controller(
    'cartCtrl',
    function (
      $scope,
      $rootScope,
      $location,
      $q,
      cart,
      modalMessage,
      ConfCache,
      RegistrationCache,
    ) {
      $rootScope.globalPage = {
        mainClass: 'container',
        footer: true,
      };

      $scope.cartRegistrations = [];
      $scope.remainingBalanceTotal = 0;

      function loadCartRegistrations() {
        const registrationIds = cart.getRegistrationIds();
        if (!registrationIds.length) {
          return;
        }

        $scope.loading = true;

        const promises = registrationIds.map((id) =>
          RegistrationCache.get(id)
            .then((registration) => {
              return ConfCache.get(registration.conferenceId).then(
                (conference) => ({ registration, conference }),
              );
            })
            .catch(() => null),
        );
        $q.all(promises)
          .then((registrations) => {
            $scope.cartRegistrations = registrations.filter(
              (item) => item !== null && item.registration.remainingBalance > 0,
            );
            calculateTotal();
          })
          .catch(() => {
            modalMessage.error('Error loading registrations');
          })
          .finally(() => {
            $scope.loading = false;
          });
      }

      function calculateTotal() {
        $scope.remainingBalanceTotal = $scope.cartRegistrations.reduce(
          (total, { registration }) => total + registration.remainingBalance,
          0,
        );
      }

      $scope.removeFromCart = function (registrationId) {
        modalMessage
          .confirm({
            title: 'Remove from Cart',
            question:
              'Are you sure you want to remove this registration from your cart?',
            yesString: 'Remove',
            noString: 'Cancel',
          })
          .then(() => {
            cart.removeRegistrationId(registrationId);

            $scope.cartRegistrations = $scope.cartRegistrations.filter(
              (registration) => registration.id !== registrationId,
            );
            calculateTotal();
          });
      };

      $scope.addEvent = function () {
        $location.path('/');
      };

      $scope.proceedToCheckout = function () {
        // Not implemented
      };

      loadCartRegistrations();
    },
  );
