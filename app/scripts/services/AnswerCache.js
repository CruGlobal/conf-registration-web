'use strict';

angular.module('confRegistrationWebApp')
  .service('AnswerCache', function AnswerCache($rootScope, $http, RegistrationCache) {
    var path = function (id) {
      return 'answers/' + (id || '');
    };

    var updateServer = function (answer) {
      if ($rootScope.registerMode !== 'preview') {
        $http.put(path(answer.id), answer);
      }
    };

    this.syncBlock = function (scope, name, conferenceId, currentRegistration) {
      scope.$watch(name, function (answer, oldAnswer) {
        if(angular.isUndefined(answer) || angular.isUndefined(oldAnswer) || angular.equals(answer, oldAnswer)){
          return;
        }

        updateServer(answer);
        RegistrationCache.updateCurrent(conferenceId, currentRegistration);
      }, true);
    };
  });
