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
            $scope.pastPayments = [];

            const currencies = _.uniq(
              $scope.cartRegistrations.map(
                ({ conference }) => conference.currency.currencyCode,
              ),
            );
            if (currencies.length > 2) {
              throw new Error('Multiple conference currencies detected');
            }
            $scope.currency = currencies[0];

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

      $scope.currentPayment = {
        paymentType: 'CREDIT_CARD',
      };

      $scope.acceptedPaymentMethods = function () {
        var registeredRegistrantTypes = $scope.registrantTypeIds.map(
          (registrantTypeId) =>
            $scope.registrantTypes.find((type) => type.id === registrantTypeId),
        );

        const paymentMethods = payment.getAcceptedPaymentMethods(
          registeredRegistrantTypes,
        );
        // Users may not pay by check because the check mailing address may be different for
        // different conferences
        paymentMethods.acceptChecks = false;
        // Users may not pay on site
        paymentMethods.acceptPayOnSite = false;
        return _.some(paymentMethods) ? paymentMethods : false;
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
