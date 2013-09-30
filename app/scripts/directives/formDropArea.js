'use strict';

angular.module('confRegistrationWebApp')
  .directive('formDropArea', function () {
    return {
      restrict: 'A',
      controller: 'FormDropAreaCtrl'
    };
  });
