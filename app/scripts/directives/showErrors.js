'use strict';

angular.module('confRegistrationWebApp')
  .directive('showErrors', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        //Logic to handle groups of inputs in one block
        if(attrs.showErrors === 'group'){
          if(!scope.inputs){
            scope.inputs = [];
          }
          scope.inputs.push(ngModelCtrl);
        }

        scope.$watch(function(scope){
            return ngModelCtrl.$invalid && (scope.currentPageVisited || ngModelCtrl.$touched || !!attrs.showErrorsInstant);
          },
          function(invalid){
            if(scope.inputs && scope.inputs.length >= 2){
              //if we are handling a group of inputs and any of the inputs are invalid and touched
              var groupInvalid = scope.inputs.some(function(currentValue){
                  return currentValue.$invalid && (scope.currentPageVisited || currentValue.$touched || !!attrs.showErrorsInstant);
                });
              element.toggleClass('has-no-error', !invalid);
              element.parents('.form-group').toggleClass('has-error', groupInvalid);
            }else{
              element.parents('.form-group').toggleClass('has-error', invalid);
            }
          }
        );
      }
    };
  });
