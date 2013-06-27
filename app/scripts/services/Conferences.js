'use strict';

angular.module('confRegistrationWebApp')
  .factory('Conferences', function () {
    var Conferences = {};

    Conferences.getAll = function () {
      return [
        {
          "id": "abc",
          "name": "A Sweet Fall Retreat"
        },
        {
          "id": "abc",
          "name": "Fall Retreat WOOO"
        },
        {
          "id": "abc",
          "name": "Fall Retreat!"
        },
        {
          "id": "abc",
          "name": "Yet Another Fall Retreat (YAFR)"
        },
        {
          "id": "abc",
          "name": "Fall Retreat Is Never Gonna Give You Up"
        }
      ]
    };

    return Conferences;
  });
