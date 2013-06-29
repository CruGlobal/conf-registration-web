'use strict';

angular.module('confRegistrationWebApp')
  .directive('page', function () {
    return {
      templateUrl: 'views/pageDirective.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.$watch('pageForm.$valid', function (valid) {
          if (valid) {
            console.log('**valid');
            $scope.$emit('pageValid');
          }
        });
        $scope.$watch('pageForm.$invalid', function (invalid) {
          if(invalid) {
            console.log('**invalid');
            $scope.$emit('pageInvalid');
          }
        });
      }
    };
  });
