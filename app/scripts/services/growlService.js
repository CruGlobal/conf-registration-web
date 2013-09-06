'use strict';

angular.module('confRegistrationWebApp')
  .service('GrowlService', function GrowlService($rootScope, Model, $timeout) {
    var growlPath, growlObject, growlTimeout, growlOn;

    //check if growl is currently active, cancel it if it is.
    this.growl = function (path, object, message){
      growlPath=path;
      growlObject=angular.copy(object);
      $rootScope.growlMessage = message;

      $timeout.cancel(growlTimeout);
      growlTimeout = $timeout(function() {
        $rootScope.growlMessage='';
      }, 5000);

      growlOn = $rootScope.$on(path, function (){
        //$rootScope.growlMessage='';
        growlOn();
      });
    }

    this.undo = function (){
      Model.update(growlPath, growlObject);
      $rootScope.growlMessage='';
      $timeout.cancel(growlTimeout);
    }
  });