'use strict';

angular.module('confRegistrationWebApp')
  .factory('Registrations', function ($resource, $http, $q) {
    var paramDefaults = {};
    var actions = {
      getAllForConference: {
        method: 'GET',
        url: 'conferences/:conferenceId/registrations',
        isArray: true
      }
    };
    var Registrations = $resource('registrations/:id', paramDefaults, actions);

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

    Registrations.create = function (conferenceId) {
      var defer = $q.defer();

      $http.post('conferences/' + conferenceId + '/registrations').success(defer.resolve);

      return defer.promise;
    };

    return Registrations;
  });
