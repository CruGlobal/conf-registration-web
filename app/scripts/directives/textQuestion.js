'use strict';

angular.module('confRegistrationWebApp')
  .directive('textQuestion', function () {
    return {
      templateUrl: 'views/textQuestion.html',
      restrict: 'E'
    };
  });
