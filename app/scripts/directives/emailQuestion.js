'use strict';

angular.module('confRegistrationWebApp')
  .directive('emailQuestion', function () {
    return {
      templateUrl: 'views/emailQuestion.html',
      restrict: 'E',
      link: function (scope, elements) {
        elements.find('input').bind('blur', function () {
          scope.updateAnswer();
          var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
          //if (filter.test(scope.answer.value)) alert('YES! Correct email address');
          //else alert('NO! Incorrect email address');
        });
      }
    };
  });
