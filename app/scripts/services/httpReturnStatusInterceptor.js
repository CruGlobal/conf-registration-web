'use strict';

angular.module('confRegistrationWebApp')
  .factory('statusInterceptor', function () {
    return {
      response: function (response) {
        if (!_.isUndefined(response.data.statusCode)) {
          response.status = response.data.statusCode;
        }
        return response;
      }
    };
  });