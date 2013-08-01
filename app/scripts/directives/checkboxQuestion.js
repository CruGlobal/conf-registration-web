'use strict';

angular.module('confRegistrationWebApp')
  .directive('checkboxQuestion', function () {
    return {
      templateUrl: 'views/checkboxQuestion.html',
      restrict: 'E'
    };
  });
