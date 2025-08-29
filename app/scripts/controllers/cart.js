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
      $scope.cartTotal = 0;

      function loadCartRegistrations() {
        const registrationIds = cart.getRegistrationIds();
        if (!registrationIds.length) {
          return;
        }

        $scope.loading = true;

        const promises = registrationIds.map((id) =>
          RegistrationCache.get(id)
            .catch(() => null)
            .then(({ conferenceId, remainingBalance }) => {
              return ConfCache.get(conferenceId)
                .catch(() => null)
                .then(
                  (conference) =>
                    conference && {
                      remainingBalance,
                      conferenceName: conference.name,
                      currencyCode: conference.currency.currencyCode,
                    },
                );
            }),
        );
        $q.all(promises)
          .then((registrations) => {
            $scope.cartRegistrations = registrations.filter(
              (registration) =>
                registration !== null && registration.remainingBalance > 0,
            );
            calculateCartTotal();
          })
          .catch(() => {
            modalMessage.error('Error loading registrations');
          })
          .finally(() => {
            $scope.loading = false;
          });
      }

      function calculateCartTotal() {
        $scope.cartTotal = $scope.cartRegistrations.reduce(
          (total, registration) => total + registration.remainingBalance,
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
            calculateCartTotal();
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
