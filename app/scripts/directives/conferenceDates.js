'use strict';

angular.module('confRegistrationWebApp')
  .directive('conferenceDates', function () {
    return {
      templateUrl: 'views/conferenceDates.html',
      restrict: 'E'
    };
  });
