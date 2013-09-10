'use strict';

angular.module('confRegistrationWebApp')
  .service('GrowlService', function GrowlService($rootScope, Model, $timeout) {
    var growlPath, growlObject, growlTimeout, cancelEventListener, ignoreNext;
    this.growl = function (path, object, message) {
      growlPath = path;
      growlObject = angular.copy(object);
      $rootScope.growlMessage = message;

      $timeout.cancel(growlTimeout);
      growlTimeout = $timeout(function () {
        $rootScope.growlMessage = '';
      }, 5000);

      ignoreNext = true;
      cancelEventListener = $rootScope.$on(path, function () {
        if (!ignoreNext) {
          $rootScope.growlMessage = '';
          cancelEventListener();
        } else {
          ignoreNext = false;
        }
      });
    };

    $rootScope.growlUndo = function () {
      Model.update(growlPath, growlObject);
      $rootScope.growlMessage = '';
      $timeout.cancel(growlTimeout);
    };
  });