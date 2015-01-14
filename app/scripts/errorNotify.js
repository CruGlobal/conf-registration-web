'use strict';
Hoptoad.setHost('errors.uscm.org');
Hoptoad.setKey('e7a93aafa70a5d3929679c5ad95bf8c7');
if (_.contains(location.hostname, 'stage')) {
  Hoptoad.setEnvironment('stage');
}

angular.module('confRegistrationWebApp').config(function ($provide) {
  $provide.decorator('$exceptionHandler', ['$delegate', function ($delegate) {
    return function (exception) {
      $delegate(exception);
      if (_.contains(location.hostname, 'localhost')) {
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
