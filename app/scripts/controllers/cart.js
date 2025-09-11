angular
  .module('confRegistrationWebApp')
  .controller(
    'cartCtrl',
    function ($scope, $rootScope, $location, cart, modalMessage, registration) {
      $rootScope.globalPage = {
        bodyClass: 'cart',
        mainClass: 'container',
        footer: true,
      };

      $scope.cartRegistrations = [];
      $scope.submittingRegistrations = false;

      $scope.$on('cartUpdated', function () {
        setCartItems(cart.registrations);
      });

      function loadCartRegistrations() {
        $scope.loading = true;
        // When the cart loads, it will trigger a "cartUpdated" event that will update $scope.cartRegistrations
        cart.loadRegistrations().finally(() => {
          $scope.loading = false;
        });
      }

      function setCartItems(registrations) {
        $scope.cartRegistrations = registrations.map((item) => {
          const existingRegistration = $scope.cartRegistrations.find(
            ({ registration }) => registration === item.registration,
          );
          return (
            existingRegistration || {
              ...item,
              checked: true,
              disabled: false,
            }
          );
        });

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

        // Assume that all registrations in the cart have the same currency
        $scope.currency = $scope.cartRegistrations[0]
          ? $scope.cartRegistrations[0].conference.currency.currencyCode
          : null;

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

        updateTotals();
      }

      function updateTotals() {
        const selectedRegistrations = $scope.cartRegistrations.filter(
          (item) => item.checked,
        );
        $scope.selectedCount = selectedRegistrations.length;

        $scope.currentRegistration = Object.fromEntries(
          [
            'calculatedMinimumDeposit',
            'calculatedTotalDue',
            'remainingBalance',
          ].map((field) => [
            field,
            selectedRegistrations.reduce(
              (total, { registration }) => total + registration[field],
              0,
            ),
          ]),
        );
        $scope.currentRegistration.pastPayments = [];
        $scope.currentPayment.amount =
          $scope.currentRegistration.remainingBalance;
      }

      $scope.toggleRegistration = function (item) {
        item.checked = !item.checked;
        updateTotals();
      };

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
            cart.removeRegistration(registrationId);
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

        const registrations = $scope.cartRegistrations
          .filter((item) => item.checked)
          .map(({ registration, conference }) => ({
            registration,
            conference,
            payment: {
              ...$scope.currentPayment,
              amount: registration.remainingBalance,
            },
          }));

        registration
          .processRegistrations(registrations)
          .then(function () {
            const registrationIds = registrations.map(
              (item) => item.registration.id,
            );
            registrationIds.forEach((id) => {
              cart.removeRegistration(id);
            });
          })
          .catch(() => {
            // Reload the registrations in case some of them errored and some completed successfully
            loadCartRegistrations();
          })
          .finally(() => {
            $scope.submittingRegistrations = false;
          });
      };

      const paymentMethodMapping = {
        CREDIT_CARD: 'acceptCreditCards',
        CHECK: 'acceptChecks',
        TRANSFER: 'acceptTransfers',
        SCHOLARSHIP: 'acceptScholarships',
        PAY_ON_SITE: 'acceptPayOnSite',
      };

      $scope.$watch(
        'currentPayment.paymentType',
        function (newPaymentType, oldPaymentType) {
          if (!newPaymentType || newPaymentType === oldPaymentType) {
            return;
          }

          $scope.cartRegistrations.forEach((item) => {
            const methodKey = paymentMethodMapping[newPaymentType];
            item.disabled = !item.acceptedPaymentMethods[methodKey];
            item.checked = !item.disabled;
          });

          updateTotals();
        },
      );

      loadCartRegistrations();
    },
  );
