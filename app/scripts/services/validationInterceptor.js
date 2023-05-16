angular
  .module('confRegistrationWebApp')
  .factory('validationInterceptor', function ($q) {
    return {
      responseError: function (rejection) {
        if (
          rejection.data &&
          rejection.data.parameterViolations &&
          rejection.data.parameterViolations.length > 0
        ) {
          if (!rejection.data.error) {
            rejection.data.error = {};
          }
          if (!rejection.data.error.message) {
            rejection.data.error.message =
              rejection.data.parameterViolations[0].message;
          }
        }

        return $q.reject(rejection);
      },
    };
  });
