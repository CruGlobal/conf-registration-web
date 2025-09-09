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
      payment,
      registration,
    ) {
      $rootScope.globalPage = {
        bodyClass: 'cart',
        mainClass: 'container',
        footer: true,
      };

      $scope.cartRegistrations = [];
      $scope.remainingBalanceTotal = 0;
      $scope.submittingRegistrations = false;

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
                (conference) => ({
                  registration,
                  conference,
                  acceptedPaymentMethods: {
                    ...payment.getAcceptedPaymentMethods(
                      registration,
                      conference,
                    ),
                    // Users may not pay by check because the check mailing address may be different
                    // for different conferences
                    acceptChecks: false,
                    // Users may not pay on site
                    acceptPayOnSite: false,
                  },
                }),
              );
            })
            // If any registrations or conferences can't be found, ignore them
            .catch(() => null),
        );
        $q.all(promises)
          .then((registrations) => {
            $scope.cartRegistrations = registrations.filter(
              (item) =>
                item !== null &&
                _.some(item.acceptedPaymentMethods) &&
                !item.registration.completed &&
                item.registration.remainingBalance > 0,
            );
            updateCart();
          })
          .catch(() => {
            modalMessage.error('Error loading registrations');
          })
          .finally(() => {
            $scope.loading = false;
          });
      }

      function updateCart() {
        $scope.registrantTypes = $scope.cartRegistrations.flatMap(
          ({ conference }) => conference.registrantTypes,
        );
        $scope.registrantTypeIds = _.uniq(
          _.map(
            $scope.cartRegistrations.flatMap(
              ({ registration }) => registration.registrants,
            ),
            'registrantTypeId',
          ),
        );
        $scope.currentRegistration = Object.fromEntries(
          [
            'calculatedMinimumDeposit',
            'calculatedTotalDue',
            'remainingBalance',
          ].map((field) => [
            field,
            $scope.cartRegistrations.reduce(
              (total, { registration }) => total + registration[field],
              0,
            ),
          ]),
        );
        $scope.currentRegistration.pastPayments = [];
        $scope.currentPayment.amount =
          $scope.currentRegistration.remainingBalance;

        // Assume that all registrations in the cart are for the same currency
        $scope.currency =
          $scope.cartRegistrations[0].conference.currency.currencyCode;

        // A payment method is accepted if any registration accepts it
        $scope.combinedAcceptedPaymentMethods = {
          acceptCreditCards: _.some(
            $scope.cartRegistrations,
            'acceptedPaymentMethods.acceptCreditCards',
          ),
          acceptTransfers: _.some(
            $scope.cartRegistrations,
            'acceptedPaymentMethods.acceptTransfers',
          ),
          acceptScholarships: _.some(
            $scope.cartRegistrations,
            'acceptedPaymentMethods.acceptScholarships',
          ),
        };
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
              ({ registration }) => registration.id !== registrationId,
            );
            updateCart();
          });
      };

      $scope.addEvent = function () {
        $location.path('/');
      };

      $scope.currentPayment = {};

      $scope.acceptedPaymentMethods = function () {
        return $scope.combinedAcceptedPaymentMethods;
      };

      $scope.submitRegistrations = function () {
        $scope.submittingRegistrations = true;

        const registrations = $scope.cartRegistrations.map((item) => ({
          ...item,
          payment: {
            ...$scope.currentPayment,
            amount: item.registration.remainingBalance,
          },
        }));

        registration
          .processRegistrations(registrations)
          .then(function () {
            $scope.cartRegistrations.forEach((item) => {
              cart.removeRegistrationId(item.registration.id);
            });
            $location.path('/');
          })
          .finally(() => {
            $scope.submittingRegistrations = false;
          });
      };

      loadCartRegistrations();
    },
  );
