'use strict';

console.log('**********************USING MOCK BACKEND**********************');

angular.module('confRegistrationWebApp')
  .config(function ($httpProvider) {
      //remove urlInterceptor
      var i = $httpProvider.interceptors.indexOf('httpUrlInterceptor');
      if(i != -1) {
        $httpProvider.interceptors.splice(i, 1);
      }
  })
  .run(function ($httpBackend, testData, uuid) {
    //$httpBackend.whenGET(/views\/.*/).passThrough();

    $httpBackend.whenGET(/^conferences\/?$/).respond(function () {
      console.log(arguments);
      var headers = {};
      return [200, conferences, headers];
    });
    $httpBackend.whenPOST(/^conferences\/?$/).respond(function (verb, url, data) {
      console.log(arguments);

      var conference = angular.extend(angular.fromJson(data), { id: uuid() });

      var headers = {
        'Location': '/conferences/' + conference.id
      };
      return [201, conference, headers];
    });
    $httpBackend.whenGET(/^conferences\/[-a-zA-Z0-9]+\/?$/).respond(function (verb, url) {
      var conferenceId = url.split('/')[1];

      var conference = testData.conference;

      return [200, conference, {}];
    });
    $httpBackend.whenPUT(/^conferences\/[-a-zA-Z0-9]+\/?$/).respond(function (verb, url, data) {
      console.log(arguments);

      var conferenceId = url.split('/')[1];

      var conference = _.find(conferences, function (conference) {
        return angular.equals(conference.id, conferenceId);
      });

      angular.extend(conference, angular.fromJson(data));

      return [200, conference, {}];
    });

    $httpBackend.whenGET(/^conferences\/[-a-zA-Z0-9]+\/registrations\/?$/).respond(function (verb, url) {
      console.log(arguments);

      var conferenceId = url.split('/')[1];

      return [200, registrations[conferenceId], {}];
    });
    $httpBackend.whenPOST(/^conferences\/[-a-zA-Z0-9]+\/registrations\/?$/).respond(function (verb, url) {
      console.log(arguments);
      var registrationId = uuid();

      var conferenceId = url.split('/')[1];

      var conference = _.find(conferences, function (conference) {
        return angular.equals(conference.id, conferenceId);
      });
      var blocks = [];
      angular.forEach(conference.pages, function (page) {
        angular.forEach(page.blocks, function (block) {
          blocks.push(block);
        });
      });
      var answers = [];
      angular.forEach(blocks, function (block) {
        answers.push({
          id: registrationId,
          block: block.id,
          registration: registrationId,
          value: {}
        });
      });

      var registration = {
        id: registrationId,
        conference: conferenceId,
        answers: answers
      };

      var headers = {
        'Location': '/registrations/' + registration.id
      };

      var registrationJson = angular.toJson(registration);
      sessionStorage.setItem(headers.Location, registrationJson);
      sessionStorage.setItem('/conferences/' + conferenceId + '/registrations/current', registration.id);

      return [201, registration, headers];
    });
    $httpBackend.whenGET(/^conferences\/[-a-zA-Z0-9]+\/registrations\/current\/?$/).respond(function (verb, url) {
      console.log(arguments);

      var conferenceId = url.split('/')[1];

      var registrationId = sessionStorage.getItem('/conferences/' + conferenceId + '/registrations/current');
      if (registrationId) {
        return [200, sessionStorage.getItem('/registrations/' + registrationId)];
      }

      return [404];
    });
    $httpBackend.whenGET(/^registrations\/[-a-zA-Z0-9]+\/?$/).respond(function (verb, url) {
      console.log(arguments);

      var registrationId = url.split('/')[1];
      var registration = sessionStorage.getItem('/registrations/' + registrationId);
      if (registration) {
        return [200, registration];
      }

      return [404];
    });

    $httpBackend.whenPUT(/^answers\/[-a-zA-Z0-9]+\/?$/).respond(function (verb, url, data) {
      console.log(arguments);
      var answer = angular.fromJson(data);

      if (!answer.registration) {
        return [400, { message: 'registration must be present' }];
      }
      if (!answer.block) {
        return [400, { message: 'block must be present' }];
      }
      if (!answer.value) {
        return [400, { message: 'value must be present' }];
      }
      if (!answer.id) {
        answer.id = uuid();
      }

      var key = '/registrations/' + answer.registration;
      var registration = angular.fromJson(sessionStorage.getItem(key));
      if (registration) {
        var answers = registration.answers;
        var existingAnswerIndex = _.findIndex(answers, { block: answer.block });
        if (existingAnswerIndex !== -1) {
          answers.splice(existingAnswerIndex, 1);
        }
        answers.push(answer);
        sessionStorage.setItem(key, angular.toJson(registration));
      }

      return [200, answer];
    });
  });
