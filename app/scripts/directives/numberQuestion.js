'use strict';

angular.module('confRegistrationWebApp')
  .directive('numberQuestion', function () {
    return {
      templateUrl: 'views/numberQuestion.html',
      restrict: 'E'
    };
  });