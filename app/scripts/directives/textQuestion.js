'use strict';

angular.module('confRegistrationWebApp')
  .directive('textQuestion', function () {
    return {
      templateUrl: 'views/textQuestion.html',
      restrict: 'E',
      link: function (scope, elements) {
        elements.find('input').bind('blur', function () {
          scope.updateAnswer();
        });
      }
    };
  });
