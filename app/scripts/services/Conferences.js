'use strict';

angular.module('confRegistrationWebApp')
  .factory('Conferences', function ($http) {

    var Conferences = {};

    Conferences.getAll = function () {
      return $http.get('conferences').then(function (response) {
        return response.data;
      });
    };

    Conferences.getById = function (id) {
      return $http.get('conferences/' + id).then(function (response) {
        return response.data;
      });
    };

    return Conferences;
  });
