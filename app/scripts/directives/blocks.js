'use strict';

angular.module('confRegistrationWebApp')
  .directive('nameQuestion', function () {
    return {
      templateUrl: 'views/blocks/nameQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('addressQuestion', function () {
    return {
      templateUrl: 'views/blocks/addressQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('checkboxQuestion', function () {
    return {
      templateUrl: 'views/blocks/checkboxQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.atLeastOneChecked = function () {
          if (!$scope.answer) { return false; }
          return angular.isDefined(_.findKey($scope.answer.value, function (v) { return v === true; }));
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('emailQuestion', function () {
    return {
      templateUrl: 'views/blocks/emailQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('numberQuestion', function (util) {
    return {
      templateUrl: 'views/blocks/numberQuestion.html',
      restrict: 'E',
      link: function (scope, element) {
        scope.$watch('numberRange.min', function () {
          scope.onValueChange();
        });

        scope.$watch('numberRange.max', function () {
          scope.onValueChange();
        });

        scope.onValueChange = function () {
          var min = '';
          var max = '';
          var val = element.children(':first-child')[0].value;

          if (scope.editBlock && scope.editBlock === true) {
            min = scope.numberRange.min;
            max = scope.numberRange.max;
            element.children(':first-child')[0].min = min;
            element.children(':first-child')[0].max = max;
          } else {
            if (util.isUndefinedOrNull(scope.block.content.range)) {
              return;
            }
            min = scope.block.content.range.min;
            max = scope.block.content.range.max;
          }

          if (!element.parent().hasClass('form-group')) {
            element.parent().addClass('form-group');
          }

          if (val !== '' && ((min && (Number(val) < Number(min))) ||
            (max && Number(val) > Number(max)))) {
            element.parent().parent().children(':nth-child(2)').addClass('invalid-range-label');
            element.parents('.form-group').toggleClass('has-error', true);
          } else {
            if (scope.editBlock && scope.editBlock === true) {
              scope.block.content.default = Number(val);
            }
            element.parent().parent().children(':nth-child(2)').removeClass('invalid-range-label');
            element.parents('.form-group').toggleClass('has-error', false);
          }
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('phoneQuestion', function () {
    return {
      templateUrl: 'views/blocks/phoneQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('radioQuestion', function () {
    return {
      templateUrl: 'views/blocks/radioQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.$watch('answer.value', function () {
          if (angular.isDefined($scope.answer)) {
            //check if answer is not in current choices
            if (!_.contains(_.pluck($scope.block.content.choices, 'value'), $scope.answer.value)) {
              $scope.otherAnswer = $scope.answer.value;
            }
          }
        });

        $scope.selectOtherAnswer = function () {
          if (!$scope.answer) { return; }
          $scope.answer.value = $scope.otherAnswer;
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('selectQuestion', function () {
    return {
      templateUrl: 'views/blocks/selectQuestion.html',
      restrict: 'E',
      controller: function ($scope, $filter) {
        $scope.$watch('block', function () {
          $scope.visibleValues = [];
          angular.forEach($scope.block.content.choices, function (c) {
            var visibleValue = c.value;
            if (c.amount) {
              visibleValue = visibleValue + ' - ' + $filter('currency')(c.amount, '$');
            }
            $scope.visibleValues.push(visibleValue);
          });
        }, true);
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('textQuestion', function () {
    return {
      templateUrl: 'views/blocks/textQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('genderQuestion', function () {
    return {
      templateUrl: 'views/blocks/genderQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('dateQuestion', function () {
    return {
      templateUrl: 'views/blocks/dateQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('yearInSchoolQuestion', function () {
    return {
      templateUrl: 'views/blocks/yearInSchoolQuestion.html',
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('textareaQuestion', function () {
    return {
      templateUrl: 'views/blocks/textareaQuestion.html',
      restrict: 'E'
    };
  });
