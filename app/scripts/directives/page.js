'use strict';

angular.module('confRegistrationWebApp')
  .directive('page', function () {
    return {
      templateUrl: 'views/pageDirective.html',
      restrict: 'E',
      controller: function ($scope) {
        $scope.$watch('pageForm.$valid', function (valid) {
          $scope.$emit('pageValid', valid);
        });
      },link: function postLink(scope, element) {
        var options = {
          inputs: {

          }
        };
      }
    };
  });
