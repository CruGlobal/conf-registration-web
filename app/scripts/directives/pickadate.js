'use strict';

angular.module('confRegistrationWebApp')
  .directive('pickADate', function() {
    return {
      templateUrl: 'views/components/pickadate.html',
      restrict: 'E',
      require: 'ngModel',
      scope: {
        'disabled': '=pickerDisabled'
      },
      link: function (scope, element, attr, ngModelController) {
        //load date value from model into datepicker
        var loaded = false;
        scope.$watch(function(){
            return ngModelController.$viewValue;
          },
          function(value){
            if(!loaded && !_.isEmpty(value)){ //only set value of picker to value of model once when directive is first loaded
              scope.picker.set('select', value, { format: 'yyyy-mm-dd', muted: true });
              loaded = true;
            }
          });

        //initialize datepicker
        scope.picker = $(element).find('input').first().pickadate({
          format: 'mmm d, yyyy',
          selectYears: true
        }).pickadate('picker');

        //when date is chosen, update model
        var onSet = function(){
          scope.$apply(function(){
            ngModelController.$setViewValue(scope.picker.get('select', 'yyyy-mm-dd'));
            ngModelController.$setTouched();
          });
        };
        scope.picker.on('set', onSet);

        //disable picker when disabled attribute is true
        scope.$watch(function(){
            return scope.disabled;
          },
          function(disabled){
            if (disabled){
              scope.picker.stop();  //this destroys the onSet event callback
            }else{
              scope.picker.start();
              scope.picker.on('set', onSet);
            }
          });

        //open datepicker when icon is clicked
        scope.open = function(event){
          scope.picker.open();
          event.stopPropagation();
        };
      }
    };
  });
