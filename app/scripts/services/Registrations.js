'use strict';

angular.module('confRegistrationWebApp')
  .factory('Registrations', function ($resource, $http, $q, Conferences, uuid) {
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
          } else {
            defer.reject(data);
          }
        });

      return defer.promise;
    };

    Registrations.resolveCurrent = function (conferenceId) {
      var defer = $q.defer();

      var conferencePromise = Conferences.get({id: conferenceId}).$then(function (response) {
        return response.resource;
      });

      var registrationPromise = Registrations.getCurrentOrCreate(conferenceId).then(function (a) {
        console.log(a);
        return a;
      });

      $q.all([conferencePromise, registrationPromise]).then(function (array) {
        var conference = array[0];
        var registration = array[0];

        if(!registration.answers) {
          registration.answers = [];
        }

        var answersByBlockId = {};
        angular.forEach(registration.answers, function (answer) {
          answersByBlockId[answer.block] = answer;
        });

        var nonContentBlocks = _.filter(conference.$blocks(), function (block) {
          return block.type.indexOf('Content') === -1;
        });

        angular.forEach(nonContentBlocks, function (block) {
          if(!answersByBlockId[block.id]) {
            registration.answers.push({
              id: uuid(),
              block: block.id,
              registration: registration.id,
              value: {}
            })
          }
        });

        defer.resolve(registration);
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
