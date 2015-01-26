'use strict';
Hoptoad.setHost('errors.uscm.org');
Hoptoad.setKey('e7a93aafa70a5d3929679c5ad95bf8c7');
if (location.hostname.indexOf('stage') > -1) {
  Hoptoad.setEnvironment('stage');
}

angular.module('confRegistrationWebApp').config(function ($provide) {
  $provide.decorator('$exceptionHandler', ['$delegate', function ($delegate) {
    return function (exception) {
      $delegate(exception);
      if (location.hostname.indexOf('localhost') > -1) {
        return;
      }
      var error = {
        type: 'Angular',
        message: exception.message,
        params: {
          angularVersion: angular.version.full
        },
        component: exception.stack
      };
      Hoptoad.notify(error);
    };
  }]);
});
