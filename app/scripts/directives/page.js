'use strict';

angular.module('confRegistrationWebApp')
  .directive('page', function () {
    return {
      templateUrl: 'views/pageDirective.html',
      restrict: 'E'
    };
  });
