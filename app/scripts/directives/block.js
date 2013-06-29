'use strict';

angular.module('confRegistrationWebApp')
  .directive('block', function () {
    return {
      templateUrl: 'views/blockDirective.html',
      restrict: 'E',
      scope: {
        'block': '=',
        'answer': '='
      }
    };
  });
