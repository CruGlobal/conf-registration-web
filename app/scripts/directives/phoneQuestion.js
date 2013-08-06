'use strict';

angular.module('confRegistrationWebApp')
  .directive('phoneQuestion', function () {
    return {
      templateUrl: 'views/phoneQuestion.html',
      restrict: 'E',
      link: function (scope, elements) {
        elements.find('input').bind('blur', function () {
          scope.updateAnswer();
        });
      }
    };
  });