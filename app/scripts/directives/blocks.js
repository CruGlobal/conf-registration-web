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
        if ($scope.wizard) {
          $scope.answer = {value: {}};
        } else {
          $scope.$watch('answer.value', function () {
            if (angular.isDefined($scope.answer)) {
              if (angular.isDefined(_.findKey($scope.answer.value, function (v) { return v === true; }))) {
                $scope.atLeastOneChecked = true;
              } else {
                $scope.atLeastOneChecked = false;
              }
            }
          }, true);
        }
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
  .directive('numberQuestion', function () {
    return {
      templateUrl: 'views/blocks/numberQuestion.html',
      restrict: 'E'
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
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('selectQuestion', function () {
    return {
      templateUrl: 'views/blocks/selectQuestion.html',
      restrict: 'E'
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