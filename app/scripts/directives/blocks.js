import nameQuestionTemplate from 'views/blocks/nameQuestion.html';
import addressQuestionTemplate from 'views/blocks/addressQuestion.html';
import checkboxQuestionTemplate from 'views/blocks/checkboxQuestion.html';
import emailQuestionTemplate from 'views/blocks/emailQuestion.html';
import numberQuestionTemplate from 'views/blocks/numberQuestion.html';
import phoneQuestionTemplate from 'views/blocks/phoneQuestion.html';
import radioQuestionTemplate from 'views/blocks/radioQuestion.html';
import selectQuestionTemplate from 'views/blocks/selectQuestion.html';
import textQuestionTemplate from 'views/blocks/textQuestion.html';
import genderQuestionTemplate from 'views/blocks/genderQuestion.html';
import dateQuestionTemplate from 'views/blocks/dateQuestion.html';
import yearInSchoolQuestionTemplate from 'views/blocks/yearInSchoolQuestion.html';
import textareaQuestionTemplate from 'views/blocks/textareaQuestion.html';
import campusQuestionTemplate from 'views/blocks/campusQuestion.html';

angular.module('confRegistrationWebApp')
  .directive('nameQuestion', function () {
    return {
      templateUrl: nameQuestionTemplate,
      restrict: 'E',
      controller: function ($scope) {
        if(!$scope.answer.value){
          $scope.answer.value = {};
        }
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('addressQuestion', function () {
    return {
      templateUrl: addressQuestionTemplate,
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('checkboxQuestion', function () {
    return {
      templateUrl: checkboxQuestionTemplate,
      restrict: 'E',
      controller: function ($scope) {
        $scope.atLeastOneChecked = function(){
          if(!$scope.answer){ return false; }
          return angular.isDefined(_.findKey($scope.answer.value, function (v) { return v === true; }));
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('emailQuestion', function () {
    return {
      templateUrl: emailQuestionTemplate,
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('numberQuestion', function () {
    return {
      templateUrl: numberQuestionTemplate,
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('phoneQuestion', function () {
    return {
      templateUrl: phoneQuestionTemplate,
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('radioQuestion', function () {
    return {
      templateUrl: radioQuestionTemplate,
      restrict: 'E',
      controller: function ($scope) {
        $scope.$watch('answer.value', function () {
          if(angular.isDefined($scope.answer)){
            //check if answer is not in current choices
            if(!_.includes(_.map($scope.block.content.choices, 'value'), $scope.answer.value)){
              $scope.otherAnswer = $scope.answer.value;
            }
          }
        });

        $scope.selectOtherAnswer = function(){
          if(!$scope.answer){ return; }
          $scope.answer.value = $scope.otherAnswer;
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('selectQuestion', function () {
    return {
      templateUrl: selectQuestionTemplate,
      restrict: 'E',
      controller: function($scope, $filter){
        $scope.$watchGroup(['block', 'days'], function() {
          $scope.visibleValues = [];
          angular.forEach($scope.block.content.choices, function(c){
            var visibleValue = c.value;
            if(c.amount){
              visibleValue = visibleValue + ' - ' + $filter('currency')($scope.days * c.amount, '$');
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
      templateUrl: textQuestionTemplate,
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('genderQuestion', function () {
    return {
      templateUrl: genderQuestionTemplate,
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('dateQuestion', function () {
    return {
      templateUrl: dateQuestionTemplate,
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
  .directive('yearInSchoolQuestion', function () {
    return {
      templateUrl: yearInSchoolQuestionTemplate,
      restrict: 'E'
    };
  });

angular.module('confRegistrationWebApp')
    .directive('textareaQuestion', function () {
      return {
        templateUrl: textareaQuestionTemplate,
        restrict: 'E'
      };
    });

angular.module('confRegistrationWebApp')
  .directive('campusQuestion', function () {
    return {
      templateUrl: campusQuestionTemplate,
      restrict: 'E',
      controller: function($scope, $http) {
        $scope.searchCampuses = function(val) {
          return $http.get('campuses/' + val).then(function(campusNames) {
            return campusNames.data;
          });
        };
      }
    };
  });
