'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsDatetimepicker', function () {
    return {
      templateUrl: 'views/components/datepicker.html',
      restrict: 'E',
      scope: {
        'localModel': '=model',
        'ngDisabled': '='
      },
      controller: function ($timeout, $scope) {
        $scope.updateTimeStamp = function (timestamp) {
          $scope.$apply(function () {
            $scope.localModel = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
          });
        };
      },
      link: function (scope, element) {
        var datePickerElement = jQuery(element).find('.datepicker');
        datePickerElement.datetimepicker({
          defaultDate: scope.localModel ? moment(scope.localModel).format('MM/DD/YYYY hh:mm A') : null
        }).on('dp.change', function (ev) {
          scope.updateTimeStamp(ev.date);
        });

        scope.$on('$destroy', function () {
          if (angular.isDefined(datePickerElement.data('DateTimePicker'))) {
            datePickerElement.data('DateTimePicker').destroy();
          }
        });
      }
    };
  });
