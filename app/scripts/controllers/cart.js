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
      registration,
      payment,
      analytics,
    ) {
      $rootScope.globalPage = {
        bodyClass: 'cart',
        mainClass: 'container',
        footer: true,
      };

      $scope.cartRegistrations = [];
      $scope.remainingBalanceTotal = 0;
      $scope.submittingRegistrations = false;

      function handleRegistrationError(error) {
        if (!error) {
          return;
        }

        modalMessage.error({
          message:
            error.message ||
            'An error occurred while attempting to complete your registrations.',
          forceAction: true,
        });
      }

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
        $scope.currentPayment.remainingBalance = $scope.remainingBalanceTotal;
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
        amount: $scope.remainingBalanceTotal,
        paymentType: 'CREDIT_CARD',
      };

      $scope.acceptedPaymentMethods = function () {
        var registeredRegistrantTypes = $scope.registrantTypeIds.map(
          (registrantTypeId) =>
            $scope.registrantTypes.find((type) => type.id === registrantTypeId),
        );

        var paymentMethods = {
          acceptCreditCards: _.some(
            registeredRegistrantTypes,
            'acceptCreditCards',
          ),
          acceptChecks: _.some(registeredRegistrantTypes, 'acceptChecks'),
          acceptTransfers: _.some(registeredRegistrantTypes, 'acceptTransfers'),
          acceptScholarships: _.some(
            registeredRegistrantTypes,
            'acceptScholarships',
          ),
          acceptPayOnSite: _.some(registeredRegistrantTypes, 'acceptPayOnSite'),
        };
        return _.some(paymentMethods) ? paymentMethods : false;
      };

      $scope.submitRegistrations = function () {
        if (!$scope.cartRegistrations.length) {
          return;
        }

        $scope.submittingRegistrations = true;

        $q.when()
          .then(function () {
            const validationPromises = $scope.cartRegistrations.map((item) =>
              registration.validatePayment(
                $scope.currentPayment,
                item.registration,
                item.conference,
              ),
            );
            return $q.all(validationPromises);
          })
          .then(function () {
            const paymentPromises = $scope.cartRegistrations.map((item) =>
              payment.pay(
                $scope.currentPayment,
                item.registration,
                item.conference,
                $scope.acceptedPaymentMethods(),
              ),
            );
            return $q.all(paymentPromises);
          })
          .then(function () {
            const completionPromises = $scope.cartRegistrations.map((item) =>
              registration.completeRegistration(item.registration),
            );
            return $q.all(completionPromises);
          })
          .then(function () {
            $scope.cartRegistrations.forEach(({ conference: conf }) => {
              analytics.track('registration', {
                eventID: conf.id,
                registeredEventName: conf.name,
              });
            });

            $scope.cartRegistrations.forEach((item) => {
              cart.removeRegistrationId(item.registration.id);
            });
            $location.path('/');
          })
          .catch(function (response) {
            handleRegistrationError((response && response.data) || response);
          })
          .finally(() => {
            $scope.submittingRegistrations = true;
          });
      };

      loadCartRegistrations();
    },
  );
