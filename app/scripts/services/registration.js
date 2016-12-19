'use strict';

angular.module('confRegistrationWebApp')
  .factory('registration', function ($http, $q, RegistrationCache, modalMessage, payment, error, uuid) {
    // Create a new registration on the server
    // Returns a promise the resolves when the registration has been created
    function createRegistration (registration) {
      return $http.put('registrations/' + registration.id, registration);
    }

    // Delete a registration on the server
    function deleteRegistration (registration) {
      return $http.delete('registrations/' + registration.id);
    }

    // Create a new registrant on the server
    // Returns a promise the resolves when the registrant has been created
    function createRegistrant (registrant) {
      return $http.put('registrants/' + registrant.id, registrant);
    }

    return {
      // Return a boolean indicating whether two registrations contain any of the same registrants
      overlapsRegistration: function (registration1, registration2) {
        return !_.isEmpty(_.intersection(
          _.map(registration1.registrants, 'email'),
          _.map(registration2.registrants, 'email')
        ));
      },

      // Load a registration from the server
      // Returns a promise the resolves to the registration once it has been loaded
      load: function (registrationId) {
        return $http.get('registrations/' + registrationId).then(function (res) {
          return res.data;
        });
      },

      // Submit payment information for a registration
      submitPayment: function (currentPayment, currentRegistration, acceptedPaymentMethods) {
        if (!payment.validate(currentPayment, currentRegistration)) {
          modalMessage.error({
            'title': 'Please correct the following errors:',
            'message': currentPayment.errors
          });
          return $q.reject();
        }

        return payment.pay(currentPayment, currentRegistration, acceptedPaymentMethods);
      },

      // Mark a current registration as completed
      completeRegistration: function (currentRegistration) {
        return $q(function (resolve, reject) {
          var registration = angular.copy(currentRegistration);

          if (registration.completed) {
            // The registration is already completed, so nothing needs to be done
            resolve();
            return;
          }

          registration.completed = true;
          RegistrationCache.update('registrations/' + registration.id, registration, function () {
            RegistrationCache.emptyCache();
            resolve();
          }, function (data) {
            currentRegistration.completed = false;
            reject(data);
          });
        }).catch(error.errorFromResponse('An error occurred while completing your registration.'));
      },

      // Take the current registration and merge it into the spouse's registration
      mergeWithSpouse: function (currentRegistration, spouseRegistration) {
        // Generate an array of new registrants that include all attributes
        var newRegistrants = currentRegistration.registrants.map(function (registrant) {
          var newRegistrantId = uuid();

          // Make a copy of the answers, but overwrite the id and registrantId attributes
          var answers = registrant.answers.map(function(answer) {
            return _.assign({}, answer, {
              id: uuid(),
              registrantId: newRegistrantId
            });
          });

          return {
            id: newRegistrantId,
            registrationId: spouseRegistration.id,
            registrantTypeId: registrant.registrantTypeId,
            answers: answers,
            firstName: registrant.firstName,
            lastName: registrant.lastName,
            email: registrant.email
          };
        });

        // Payload for new spouse registration
        var newSpouseRegistration = {
          id: spouseRegistration.id,
          conferenceId: currentRegistration.conferenceId,
          registrants: newRegistrants.map(function (registrant) {
            // When creating a new registration, only a few registrant attributes are required, so only keep a few of the
            // registrant attributes
            var sparseRegistrant = _.pick(registrant, ['id', 'registrationId', 'registrantTypeId']);
            sparseRegistrant.answers = [];
            return sparseRegistrant;
          })
        };

        // Add new registration
        return createRegistration(newSpouseRegistration)
          .then(function () {
            // Add registrants to new registration
            // Advance to the next step after all the registrations have been created
            return $q.all(newRegistrants.map(createRegistrant));
          }).then(function () {
            // Delete existing registration
            return deleteRegistration(currentRegistration);
          }).catch(error.errorFromResponse('An error occurred while merging spouse registrations.'));
      }
    };
  });
