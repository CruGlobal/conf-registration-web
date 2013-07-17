'use strict';

angular.module('confRegistrationWebApp')
  .directive('emailQuestion', function () {
    return {
      templateUrl: 'views/emailQuestion.html',
      restrict: 'E',
      link: function (scope, elements) {
        elements.find('input').bind('blur', function () {
          scope.updateAnswer();
        });
      }
    };
  });
