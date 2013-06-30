'use strict';

angular.module('confRegistrationWebApp')
  .factory('Registrations', function ($resource, $http) {
    var Registrations = $resource('registrations/:id');

    Registrations.getCurrentForConference = function (conferenceId) {
      return $http.get('conferences/' + conferenceId + '/registrations/current').then(function (response) {
        return response.data;
      });
    };

    Registrations.getAllForConference = function (conferenceId) {
      return $http.get('conferences/' + conferenceId + '/registrations').then(function (response) {
        return response.data;
      });
    };

    return Registrations;
  });
