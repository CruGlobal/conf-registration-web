'use strict';

angular.module('confRegistrationWebApp')
  .directive('radioQuestion', function () {
    return {
      templateUrl: 'views/radioQuestion.html',
      restrict: 'E'
    };
  });
