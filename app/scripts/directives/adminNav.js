'use strict';

angular.module('confRegistrationWebApp')
  .directive('adminNav', function () {
    return {
      templateUrl: 'views/adminNav.html',
      restrict: 'A'
    };
  });
