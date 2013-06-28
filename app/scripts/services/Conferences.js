'use strict';

angular.module('confRegistrationWebApp')
  .factory('Conferences', function ($resource) {
    return $resource('conferences/:id');
  });
