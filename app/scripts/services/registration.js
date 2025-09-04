angular
  .module('confRegistrationWebApp')
  .factory(
    'registration',
    function ($q, RegistrationCache, modalMessage, payment, error, analytics) {
      // Display an error that occurred during registration completion
      function handleRegistrationError(error) {
        if (!error) {
          return;
        }

        modalMessage.error({
          message:
            error.message ||
            'An error occurred while attempting to complete your registration.',
          forceAction: true,
        });
      }

      // Validate payment information for a registration
      function validatePayment(
        currentPayment,
        currentRegistration,
        conference,
      ) {
        if (payment.validate(currentPayment, currentRegistration, conference)) {
          return $q.when();
        } else {
          modalMessage.error({
            title: 'Please correct the following errors:',
            message: currentPayment.errors,
          });
          return $q.reject();
        }
      }

      // Mark a current registration as completed
      function completeRegistration(currentRegistration) {
        return $q(function (resolve, reject) {
          var registration = angular.copy(currentRegistration);

          if (registration.completed) {
            // The registration is already completed, so nothing needs to be done
            resolve();
            return;
          }

          registration.completed = true;
          RegistrationCache.update(
            'registrations/' + registration.id,
            registration,
            function () {
              RegistrationCache.emptyCache();
              resolve();
            },
            function (response) {
              currentRegistration.completed = false;
              reject(response);
            },
          );
        }).catch(
          error.errorFromResponse(
            'An error occurred while completing your registration.',
          ),
        );
      }

      return {
        // Process complete registration flow for one or more registrations
        processRegistrations: function (registrations, acceptedPaymentMethods) {
          return $q
            .when()
            .then(function () {
              const validationPromises = registrations.map((item) =>
                validatePayment(
                  item.payment,
                  item.registration,
                  item.conference,
                ),
              );
              return $q.all(validationPromises);
            })
            .then(function () {
              const paymentPromises = registrations.map((item) =>
                payment.pay(
                  item.payment,
                  item.conference,
                  item.registration,
                  acceptedPaymentMethods,
                ),
              );
              return $q.all(paymentPromises);
            })
            .then(function () {
              const completionPromises = registrations.map((item) =>
                completeRegistration(item.registration),
              );
              return $q.all(completionPromises);
            })
            .then(
              function () {
                registrations.forEach(({ conference }) => {
                  analytics.track('registration', {
                    eventID: conference.id,
                    registeredEventName: conference.name,
                  });
                });
              },
              function (response) {
                handleRegistrationError(
                  (response && response.data) || response,
                );
                return $q.reject(response);
              },
            );
        },
      };
    },
  );
