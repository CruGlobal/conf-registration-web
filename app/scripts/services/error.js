
angular.module('confRegistrationWebApp')
  .factory('error', function ($log) {
    return {
      // Generate a promise catch handler that generates an Error object from an HTTP response object
      errorFromResponse: function (defaultErrorMessage) {
        return function (res) {
          $log.error(res);

          // Extract the error from the payload
          var error = res.data && res.data.error;

          // Use the error message if present or the provided default message otherwise
          throw new Error(error ? error.message : defaultErrorMessage);
        };
      }
    };
  });
