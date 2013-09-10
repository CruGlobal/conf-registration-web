'use strict';

angular.module('confRegistrationWebApp')
  .service('GrowlService', function GrowlService($rootScope, Model, $timeout) {
    var growlPath, growlObject, growlTimeout, growlOn, ignoreNext;
    this.growl = function (path, object, message) {
      growlPath = path;
      growlObject = angular.copy(object);
      $rootScope.growlMessage = message;

      $timeout.cancel(growlTimeout);
      growlTimeout = $timeout(function () {
        $rootScope.growlMessage = '';
      }, 5000);

      ignoreNext = true;
      growlOn = $rootScope.$on(path, function () {
        if (!ignoreNext) {
          $rootScope.growlMessage = '';
          growlOn();
        } else {
          ignoreNext = false;
        }
      });
    };

    this.undo = function () {
      Model.update(growlPath, growlObject);
      $rootScope.growlMessage = '';
      $timeout.cancel(growlTimeout);
    };
  });