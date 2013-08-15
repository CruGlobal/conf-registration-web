'use strict';

angular.module('confRegistrationWebApp')
  .factory('enforceAuth', function ($route, $dialog, $cookies, $q) {
    var defer = $q.defer();

    if(angular.isDefined($cookies.crsToken)) {
      defer.resolve('Authorization present.');
    } else {
      console.log('show login dialog');
    }

    return defer.promise;
  });
