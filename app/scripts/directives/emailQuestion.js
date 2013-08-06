'use strict';

angular.module('confRegistrationWebApp')
  .directive('emailQuestion', function () {
    return {
      templateUrl: 'views/emailQuestion.html',
      restrict: 'E'
    };
  });
