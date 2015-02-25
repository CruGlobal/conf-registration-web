'use strict';

angular.module('confRegistrationWebApp').directive('autoFocus', function($timeout) {
  return {
    link: {
      restrict: 'A',
      post: function postLink(scope, element) {
        $timeout(function () {
          element[0].focus();
        }, 300);
      }
    }
  };
});
