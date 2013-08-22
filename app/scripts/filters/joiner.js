'use strict';

angular.module('confRegistrationWebApp')
  .filter('joiner', function () {
    return function (input, separator) {
      if(angular.isArray(input)) {
        return input.join(separator || ', ');
      }
      return input;
    };
  });
