angular
  .module('confRegistrationWebApp')
  .service('GrowlService', function GrowlService($rootScope, $timeout) {
    // eslint-disable-next-line no-unused-vars
    var growlScope, growlObject, growlName, growlTimeout;
    this.growl = function(scope, name, object, message) {
      growlName = name;
      growlScope = scope;
      growlObject = angular.copy(object);
      $rootScope.growlMessage = message;

      $timeout.cancel(growlTimeout);
      growlTimeout = $timeout(function() {
        $rootScope.growlMessage = '';
      }, 6000);
    };

    $rootScope.growlUndo = function() {
      eval('growlScope.' + growlName + ' = growlObject;');
      $rootScope.growlMessage = '';
      $timeout.cancel(growlTimeout);
    };
  });
