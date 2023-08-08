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
        graduationDate: '=graduationDate',
      },
      controller: function ($timeout, $scope) {
        $scope.updateTimeStamp = function (timestamp) {
          $scope.$apply(function () {
            $scope.localModel = moment(new Date(timestamp)).format(
              'YYYY-MM-DD HH:mm:ss',
            );
          });
        };
      },
      link: function (scope, element) {
        var datePickerElement = angular.element(element).find('.datepicker');
        var initialDate =
          scope.localModel && scope.graduationDate
            ? scope.localModel
            : scope.localModel
            ? moment(new Date(scope.localModel)).format('MM/DD/YYYY hh:mm A')
            : null;
        let dateOptions = scope.graduationDate
          ? {
              viewMode: 'years',
              format: 'MMMM YYYY',
              defaultDate: initialDate,
              useCurrent: false,
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
          .datetimepicker(dateOptions)
          .on('dp.change', function (ev) {
            scope.updateTimeStamp(ev.date);
          });
        if (scope.graduationDate) {
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
