'use strict';

angular.module('confRegistrationWebApp')
  .directive('nameQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/nameQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.validators = {
          firstName : {required: validation.genericValidators.required($scope.block.required)},
          lastName : {required: validation.genericValidators.required($scope.block.required)}
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('addressQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/addressQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.validators = {
          address1 : {required: validation.genericValidators.required($scope.block.required)},
          city : {required: validation.genericValidators.required($scope.block.required)},
          state : {required: validation.genericValidators.required($scope.block.required)},
          zip : {required: validation.genericValidators.required($scope.block.required),
            maxLength: validation.genericValidators.maxLength(12)}
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('checkboxQuestion', function () {
    return {
      templateUrl: 'views/blocks/checkboxQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.validators = {
          value : {requiredAndAtLeastOneChecked: function(){
            //$scope.atLeastOneChecked is used in the ng-required attribute of all choices so that when the value of atLeastOneChecked changes, all inputs are revalidated.
            $scope.atLeastOneChecked = angular.isDefined($scope.answer) && _.any($scope.answer.value, function(value){ return value === true; });
            return !$scope.block.required || $scope.atLeastOneChecked;
          }}
        };
        if ($scope.wizard) {
          $scope.answer = {value: {}};
        }
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('emailQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/emailQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.validators = {
          value: {required: validation.genericValidators.required($scope.block.required),
            email: validation.genericValidators.email()}
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('numberQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/numberQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        //named number2 because of a name collision with the number parser
        $scope.validators = {
          value: {required: validation.genericValidators.required($scope.block.required),
            number2: validation.genericValidators.number()}
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('phoneQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/phoneQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.validators = {
          value: {required: validation.genericValidators.required($scope.block.required),
            phone: validation.genericValidators.phone()}
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('radioQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/radioQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.validators = {
          value: {required: validation.genericValidators.required($scope.block.required)}
        };
        $scope.$watch('answer.value', function () {
          if(angular.isDefined($scope.answer)){
            //check if answer is not in current choices
            if(!_.contains(_.pluck($scope.block.content.choices, 'value'), $scope.answer.value)){
              $scope.otherAnswer = $scope.answer.value;
            }
          }
        });
        if($scope.wizard){
          $scope.answer = {
            value: ''
          };
        }
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('selectQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/selectQuestion.html',
      restrict: 'E',
      controller: function ($scope, $filter) {
        $scope.validators = {
          value: {required: validation.genericValidators.required($scope.block.required)}
        };
        $scope.generateVisibleOption = function(choice){
          var visibleOption = choice.value;
          if(choice.amount){
            visibleOption += ' - ' + $filter('moneyFormat')(choice.amount);
          }
          return visibleOption;
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('textQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/textQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.validators = {
          value: {required: validation.genericValidators.required($scope.block.required)}
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('genderQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/genderQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.validators = {
          value: {required: validation.genericValidators.required($scope.block.required)}
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('dateQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/dateQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.validators = {
          value: {required: validation.genericValidators.required($scope.block.required)}
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('yearInSchoolQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/yearInSchoolQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.validators = {
          value: {required: validation.genericValidators.required($scope.block.required)}
        };
      }
    };
  });

angular.module('confRegistrationWebApp')
  .directive('textareaQuestion', function (validation) {
    return {
      templateUrl: 'views/blocks/textareaQuestion.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.validators = {
          value: {required: validation.genericValidators.required($scope.block.required)}
        };
      }
    };
  });
