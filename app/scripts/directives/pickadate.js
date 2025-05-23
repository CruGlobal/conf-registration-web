import moment from 'moment';
import template from 'views/components/pickadate.html';

angular
  .module('confRegistrationWebApp')
  .directive('pickADate', function (DateRangeService) {
    return {
      templateUrl: template,
      restrict: 'E',
      require: 'ngModel',
      scope: {
        block: '=block',
        disabled: '=pickerDisabled',
        minDate: '=?pickerMinDate',
        maxDate: '=?pickerMaxDate',
        ariaLabelledBy: '@pickerLabelledBy',
      },
      link: function (scope, element, attr, ngModelController) {
        //load date value from model into datepicker
        var loaded = false;
        scope.$watch(
          function () {
            return ngModelController.$viewValue;
          },
          function (value) {
            if (!loaded && !_.isEmpty(value)) {
              //only set value of picker to value of model once when directive is first loaded
              scope.picker.set('select', value, {
                format: 'yyyy-mm-dd',
                muted: true,
              });
              loaded = true;
            }
          },
        );

        var pickerOptions = {
          format: 'mmm d, yyyy',
          selectYears: 200,
          selectMonths: 12,
        };

        if (element.parents('.modal').length) {
          pickerOptions.container = 'body';
        }

        //initialize datepicker
        scope.picker = angular
          .element(element)
          .find('input')
          .first()
          .pickadate(pickerOptions)
          .pickadate('picker');

        //function to set min date
        scope.setMinDate = function () {
          if (!angular.isUndefined(scope.minDate) && scope.minDate !== '') {
            var dateArray = scope.minDate.split('-');
            dateArray[1] = dateArray[1] - 1;
            scope.picker.set('min', dateArray);
          }
        };

        //function to set max date
        scope.setMaxDate = function () {
          if (!angular.isUndefined(scope.maxDate) && scope.maxDate !== '') {
            var dateArray = scope.maxDate.split('-');
            dateArray[1] = dateArray[1] - 1;
            scope.picker.set('max', dateArray);
          }
        };

        //function to correct current selected date if min and max date changed
        scope.checkDateRange = function () {
          if (
            angular.isUndefined(scope.picker.get('select', 'yyyy-mm-dd')) ||
            scope.picker.get('select', 'yyyy-mm-dd') === '' ||
            ((angular.isUndefined(scope.maxDate) || scope.maxDate === '') &&
              (angular.isUndefined(scope.minDate) || scope.minDate === ''))
          ) {
            return;
          }

          var date = moment(scope.picker.$node[0].value, 'MMM DD, YYYY');
          var startDate = moment(scope.minDate, 'YYYY-MM-DD');
          var endDate = moment(scope.maxDate, 'YYYY-MM-DD');
          if (
            (!angular.isUndefined(scope.minDate) &&
              scope.minDate !== '' &&
              date.isBefore(startDate)) ||
            (!angular.isUndefined(scope.maxDate) &&
              scope.maxDate !== '' &&
              date.isAfter(endDate))
          ) {
            scope.picker.clear();
          } else {
            scope.picker.$node[0].value = scope.picker.get(
              'select',
              'mmm d, yyyy',
            );
          }
        };

        //set min and max date
        scope.setMinDate();
        scope.setMaxDate();

        scope.$watch(
          'minDate',
          function (newMinDate) {
            if (angular.isUndefined(newMinDate) || newMinDate === '') {
              scope.picker.set('min', false);
              return;
            }

            var dateArray = newMinDate.split('-');
            dateArray[1] = dateArray[1] - 1;
            scope.picker.set('min', dateArray);
            scope.checkDateRange();
          },
          true,
        );

        scope.$watch(
          'maxDate',
          function (newMaxDate) {
            if (angular.isUndefined(newMaxDate) || newMaxDate === '') {
              scope.picker.set('max', false);
              return;
            }

            var dateArray = newMaxDate.split('-');
            dateArray[1] = dateArray[1] - 1;
            scope.picker.set('max', dateArray);
            scope.checkDateRange();
          },
          true,
        );

        //when date is chosen, update model
        var onSet = function () {
          const value = scope.picker.get('select', 'yyyy-mm-dd');

          ngModelController.$setViewValue(value);
          ngModelController.$setTouched();

          if (angular.isDefined(scope.block)) {
            DateRangeService.emitChange(scope.block.id, value);
          }
        };
        scope.picker.on('set', onSet);

        //disable picker when disabled attribute is true
        scope.$watch(
          function () {
            return scope.disabled;
          },
          function (disabled) {
            if (disabled) {
              scope.picker.stop(); //this destroys the onSet event callback
            } else {
              scope.picker.start();
              scope.picker.on('set', onSet);

              scope.setMinDate();
              scope.setMaxDate();
            }
          },
        );

        scope.$watch('ariaLabelledBy', (ariaLabelledBy) => {
          scope.picker.$node.attr('aria-labelledby', ariaLabelledBy);
        });

        //open datepicker when icon is clicked
        scope.open = function (event) {
          scope.picker.open();
          event.stopPropagation();
        };
      },
    };
  });
