'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsDatetimepicker', function () {
    return {
      templateUrl: 'views/components/datepicker.html',
      restrict: 'E',
      scope: {
        'model': '=model',
        'dateOnly': '=dateOnly',
        'required': '=required',
        'disabled': '=disabled'
      },
      controller: function ($timeout, $scope) {
        $scope.updateTimeStamp = function (timestamp) {
          $scope.$apply(function () {
            if($scope.dateOnly){
              $scope.model = moment(timestamp).format('YYYY-MM-DD');
            }else{
              $scope.model = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
            }
          });
        };
      },
      link: function (scope, element) {
        var datePickerElement = jQuery(element).find('.datepicker');
        var dateFormat = 'MM/DD/YYYY hh:mm A';
        if(scope.dateOnly){
          dateFormat = 'M/D/YYYY';
        }
        datePickerElement.datetimepicker({
          defaultDate: moment(scope.model),
          format: dateFormat
        }).on('dp.change', function (ev) {
          scope.updateTimeStamp(ev.date);
        });

        scope.$watch(function(){
            return scope.disabled;
          },
          function(){
            if(scope.disabled){
              datePickerElement.data('DateTimePicker').disable();
            }else{
              datePickerElement.data('DateTimePicker').enable();
            }
          });

        scope.$on('$destroy', function () {
          if (angular.isDefined(datePickerElement.data('DateTimePicker'))) {
            datePickerElement.data('DateTimePicker').destroy();
          }
        });
      }
    };
  });
