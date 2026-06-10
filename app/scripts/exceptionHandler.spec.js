import 'angular-mocks';
import { Rollbar } from 'scripts/errorNotify.js';

describe('Service: $exceptionHandler', function () {
  beforeEach(function () {
    angular.mock.module('confRegistrationWebApp');
    angular.mock.module(function ($exceptionHandlerProvider) {
      $exceptionHandlerProvider.mode('log');
    });
  });

  it('should report exceptions to Rollbar', inject(function (
    $exceptionHandler,
  ) {
    spyOn(Rollbar, 'error');
    const exception = new Error('boom');

    $exceptionHandler(exception, 'digest');

    expect(Rollbar.error).toHaveBeenCalledWith(exception, { cause: 'digest' });
  }));
});
