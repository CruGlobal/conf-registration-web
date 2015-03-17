'use strict';

angular.module('confRegistrationWebApp')
  .directive('showErrors', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, element, attrs, ngModelCtrl) {
        //adds validator functions from blocks.js to the ngModel as validators
        if($scope.block.validators !== undefined) {
          if (_.has($scope.block.validators, 'value')) { //condition for blocks with only one input element and therefore only one answer
            _.merge(ngModelCtrl.$validators, $scope.block.validators.value);
          }else{
            _.merge(ngModelCtrl.$validators, $scope.block.validators[attrs.ngModel.replace('answer.value.', '')]);
          }
        }

        //Logic to handle groups of inputs in one block
        if(attrs.showErrors === 'group'){
          if(!$scope.inputs){
            $scope.inputs = [];
          }
          $scope.inputs.push(ngModelCtrl);
        }

        $scope.$watch(function($scope){
            return ngModelCtrl.$invalid && ($scope.currentPageVisited || ngModelCtrl.$touched);
          },
          function(invalid){
            if($scope.inputs && $scope.inputs.length >= 2){
              //if we are handling a group of inputs and any of the inputs are invalid and touched
              var groupInvalid = $scope.inputs.some(function(currentValue){
                return currentValue.$invalid && ($scope.currentPageVisited || currentValue.$touched);
              });
              element.toggleClass('has-no-error', !invalid);
              element.parents('.form-group').toggleClass('has-error', groupInvalid);
            }else{
              element.parents('.form-group').toggleClass('has-error', invalid);
            }
          }
        );
      }
    };
  });
