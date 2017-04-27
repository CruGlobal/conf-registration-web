'use strict';

angular.module('confRegistrationWebApp')
  .factory('registration', function ($q, RegistrationCache, modalMessage, payment, error) {
    return {
      // Validate payment information for a registration
      validatePayment: function (currentPayment, currentRegistration) {
        if (payment.validate(currentPayment, currentRegistration)) {
          return $q.when();
        } else {
          modalMessage.error({
            'title': 'Please correct the following errors:',
            'message': currentPayment.errors
          });
          return $q.reject();
        }
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
          }, function (response) {
            currentRegistration.completed = false;
            reject(response.data);
          });
        }).catch(error.errorFromResponse('An error occurred while completing your registration.'));
      }
    };
  });
