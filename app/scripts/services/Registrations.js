'use strict';

angular.module('confRegistrationWebApp')
  .factory('Registrations', function ($resource, $http, $q) {
    var Registrations = $resource('registrations/:id');

    Registrations.getCurrentOrCreate = function (conferenceId) {
      var defer = $q.defer();

      $http.get('conferences/' + conferenceId + '/registrations/current')
        .success(defer.resolve)
        .error(function (data, status) {
          if (status === 404) {
            Registrations.create(conferenceId).then(defer.resolve);
          }
          defer.reject(data);
        });

      return defer.promise;
    };

    Registrations.getAllForConference = function (conferenceId) {
      return $http.get('conferences/' + conferenceId + '/registrations').then(function (response) {
        return response.data;
      });
    };

    Registrations.create = function (conferenceId) {
      var defer = $q.defer();

      $http.post('conferences/' + conferenceId + '/registrations').success(defer.resolve);

      return defer.promise;
    };

    return Registrations;
  });
