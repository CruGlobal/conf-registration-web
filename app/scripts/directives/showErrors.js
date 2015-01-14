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

        scope.$watch(function(){
            if(!scope.inputs){
              return ngModelCtrl.$invalid && ngModelCtrl.$touched;
            }else{
              //if we are handling a group of inputs and any of the inputs are invalid and touched
              return scope.inputs.some(function(currentValue){
                  return currentValue.$invalid;
                }) &&
                scope.inputs.every(function(currentValue){
                  return currentValue.$touched;
                });
            }
          },
          function(invalid){
            element.parents('.form-group').toggleClass('has-error', invalid);
          }
        );
      }
    };
  });
