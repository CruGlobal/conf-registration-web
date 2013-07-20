'use strict';

angular.module('confRegistrationWebApp')
  .factory('currentRegistrationInterceptor', function($q, $injector) {
    return {
      'responseError': function (rejection) {
        var regExp = /conferences\/[-a-zA-Z0-9]+\/registrations\/current\/?$/;
        if(rejection.status === 404 && regExp.test(rejection.config.url)) {
          var url = rejection.config.url.split('/');
          if(_.isEmpty(_.last(url))) {
            url.pop();
          }
          url.pop();
          return $injector.get('$http').post(url.join('/'));
        }
        return $q.reject(rejection);
      }
    };
  });
