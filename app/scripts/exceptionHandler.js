import { Rollbar } from 'scripts/errorNotify.js';

// AngularJS catches digest/interpolation exceptions internally and routes them
// through $exceptionHandler, so they never hit window.onerror and Rollbar's
// captureUncaught misses them. This decorator forwards them to Rollbar.
angular.module('confRegistrationWebApp').config(function ($provide) {
  $provide.decorator('$exceptionHandler', function ($delegate) {
    return function (exception, cause) {
      Rollbar.error(exception, { cause: cause });
      $delegate(exception, cause);
    };
  });
});
