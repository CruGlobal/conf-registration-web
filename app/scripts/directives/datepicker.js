import moment from 'moment';
import template from 'views/components/datepicker.html';

angular.module('confRegistrationWebApp')
  .directive('crsDatetimepicker', function () {
    return {
      templateUrl: template,
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
        var datePickerElement = angular.element(element).find('.datepicker');
        var initialDate = scope.localModel ? moment(scope.localModel).format('MM/DD/YYYY hh:mm A') : null;
        datePickerElement.datetimepicker().datetimepicker('defaultDate', initialDate).on('dp.change', function (ev) {
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
