import moment from 'moment';
import template from 'views/components/datepicker.html';

angular
  .module('confRegistrationWebApp')
  .directive('crsDatetimepicker', function () {
    return {
      templateUrl: template,
      restrict: 'E',
      scope: {
        localModel: '=model',
        ngDisabled: '=',
        monthYearOnly: '=monthYearOnly',
      },
      controller: function ($timeout, $scope) {
        $scope.updateTimeStamp = function (timestamp) {
          //For the Graduation date question, set the day to 10. The API needs the day but that could change in the future.
          timestamp = $scope.monthYearOnly
            ? moment(new Date(timestamp)).set('date', 10)
            : timestamp;
          $scope.$apply(function () {
            let dateSaveFormat = $scope.monthYearOnly
              ? 'YYYY-MM-DD'
              : 'YYYY-MM-DD HH:mm:ss';
            $scope.localModel = moment(new Date(timestamp)).format(
              dateSaveFormat,
            );
          });
        };
      },
      link: function (scope, element) {
        var datePickerElement = angular.element(element).find('.datepicker');
        var initialDate = scope.localModel
          ? moment(new Date(scope.localModel)).format('YYYY-MM-DD HH:mm:ss')
          : null;
        scope.dateOptions = scope.monthYearOnly
          ? {
              viewMode: 'years',
              format: 'MMMM YYYY',
              defaultDate: initialDate,
              useCurrent: false,
              keepOpen: false,
              allowInputToggle: true,
              extraFormats: [
                'MM/YY',
                'MM/YYYY',
                'MM-YY',
                'MM-YYYY',
                'MMM-YYYY',
                'MMMM-YYYY',
              ],
            }
          : {
              defaultDate: initialDate,
            };
        datePickerElement
          .datetimepicker(scope.dateOptions)
          .on('dp.change', function (ev) {
            scope.updateTimeStamp(ev.date);
          });
        if (scope.monthYearOnly) {
          datePickerElement.find('input')[0].placeholder = 'Month - Year';
        }

        scope.$on('$destroy', function () {
          if (angular.isDefined(datePickerElement.data('DateTimePicker'))) {
            datePickerElement.data('DateTimePicker').destroy();
          }
        });
      },
    };
  });
