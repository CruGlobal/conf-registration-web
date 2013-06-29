'use strict';

angular.module('confRegistrationWebApp')
  .directive('page', function () {
    return {
      templateUrl: 'views/pageDirective.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.$watch('pageForm.$valid', function (valid) {
          console.log('**valid ' + valid);
          $scope.$emit('pageValid', valid);
        });
      }
    };
  });
