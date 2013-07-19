'use strict';

angular.module('confRegistrationWebApp')
  .factory('answers', function($resource) {
    var paramDefaults = {
    };
    var actions = {
      update: {
        method: 'PUT',
        params: {
          id: '@id'
        },
        isArray: false,
        responseType: 'json'
      }
    };
    return $resource('answers/:id', paramDefaults, actions);
  });
