'use strict';

angular.module('confRegistrationWebApp')
  .factory('Conferences', function () {
    var conferences = [
      {
        "id": "012",
        "name": "A Sweet Fall Retreat"
      },
      {
        "id": "123",
        "name": "Fall Retreat WOOO"
      },
      {
        "id": "234",
        "name": "Fall Retreat!"
      },
      {
        "id": "345",
        "name": "Yet Another Fall Retreat (YAFR)"
      },
      {
        "id": "456",
        "name": "Fall Retreat Is Never Gonna Give You Up"
      }
    ];

    var Conferences = {};

    Conferences.getAll = function () {
      return conferences;
    };

    Conferences.getById = function (id) {
      for (var i = 0; i < conferences.length; i++) {
        if(angular.equals(id, conferences[i].id)) {
          return conferences[i];
        }
      }
    };

    return Conferences;
  });
