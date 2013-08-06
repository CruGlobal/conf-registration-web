'use strict';

angular.module('confRegistrationWebApp')
  .directive('nameQuestion', function () {
    return {
      templateUrl: 'views/nameQuestion.html',
      restrict: 'E'
    };
  });
