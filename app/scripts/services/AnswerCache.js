'use strict';

angular.module('confRegistrationWebApp')
  .service('AnswerCache', function AnswerCache($rootScope, $http, RegistrationCache) {

    this.syncBlock = function (scope, name, conferenceId, currentRegistration) {
      scope.$watch(name, function (answer, oldAnswer) {
        if(angular.isUndefined(answer) || angular.isUndefined(oldAnswer) || angular.equals(answer, oldAnswer)){
          return;
        }

        RegistrationCache.updateCurrent(conferenceId, currentRegistration);
      }, true);
    };
  });
