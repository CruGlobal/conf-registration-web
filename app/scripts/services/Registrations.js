'use strict';

angular.module('confRegistrationWebApp')
  .factory('Registrations', function ($resource, $http) {
    var Registrations = $resource('registrations/:id');

    Registrations.getForConference = function (conferenceId) {
      return $http.get('conferences/' + conferenceId + '/registrations').then(function (response) {
        return response.data;
      });
    };

    return Registrations;
  });
