'use strict';

console.log('**********************USING MOCK BACKEND**********************');

angular.module('confRegistrationWebApp')
  .run(function ($httpBackend, uuid) {

    $httpBackend.whenGET(/views\/.*/).passThrough();

    var registrations = {
      '012': [
        {
          'user': 'user-1',
          'answers': [
            {
              'block': 'block-2',
              'value': {
                firstName: 'Ron',
                lastName: 'Steve'
              }
            },
            {
              'block': 'block-4',
              'value': 'Man'
            },
            {
              'block': 'block-5',
              'value': 'Yes'
            },
            {
              'block': 'block-6',
              'value': 'No'
            },
            {
              'block': 'block-7',
              'value': 'Waffles'
            },
            {
              'block': 'block-8',
              'value': 'Burger'
            },
            {
              'block': 'block-9',
              'value': 'Steak'
            }
          ]
        },
        {
          'user': 'user-2',
          'answers': [
            {
              'block': 'block-2',
              'value': 'Jerry'
            },
            {
              'block': 'block-3',
              'value': 'Perdue'
            },
            {
              'block': 'block-4',
              'value': 'Man'
            },
            {
              'block': 'block-5',
              'value': 'Yes'
            },
            {
              'block': 'block-6',
              'value': 'Yes'
            },
            {
              'block': 'block-7',
              'value': 'Pancakes'
            },
            {
              'block': 'block-8',
              'value': 'Sandwich'
            },
            {
              'block': 'block-9',
              'value': 'Shrimp'
            }
          ]
        },
        {
          'user': 'user-3',
          'answers': [
            {
              'block': 'block-2',
              'value': 'Tom'
            },
            {
              'block': 'block-4',
              'value': 'Man'
            },
            {
              'block': 'block-5',
              'value': 'No'
            },
            {
              'block': 'block-6',
              'value': 'Yes'
            },
            {
              'block': 'block-7',
              'value': 'Omelettes'
            },
            {
              'block': 'block-8',
              'value': 'Soup'
            },
            {
              'block': 'block-9',
              'value': 'Lobster'
            }
          ]
        }
      ]
    };

    var conferences = [
      {
        'id': '012',
        'name': 'A Sweet Fall Retreat',
        'landingPage': {
          'blocks':[
            {
              'id': 'landingpage-1',
              'title': 'Location',
              'type': 'paragraphContent',
              'content': '123 Main St. Orlando, FL, 32828'
            },
            {
              'id': 'landingpage-2',
              'title': 'Registration Begins',
              'type': 'paragraphContent',
              'content': 'August 19, 2013 12:00 AM Eastern Time'
            },
            {
              'id': 'landingpage-2',
              'title': 'Registration Ends',
              'type': 'paragraphContent',
              'content': 'October 12, 2013 3:00 AM Eastern Time'
            },
            {
              'id': 'landingpage-2',
              'title': 'Fall Retreat Starts',
              'type': 'paragraphContent',
              'content': 'October 18, 2013 6:00 PM Eastern Time'
            },
            {
              'id': 'landingpage-2',
              'title': 'Fall Retreat Ends',
              'type': 'paragraphContent',
              'content': 'October 20, 2013 10:00 AM Eastern Time'
            },
            {
              'id': 'landingpage-2',
              'title': 'Contact Info',
              'type': 'paragraphContent',
              'content': 'John Smith <john.smith@example.com> 555-555-5555'
            }
          ]
        },
        'pages': [
          {
            'id': '1',
            'title': 'About You',
            'blocks': [
              {
                'id': 'block-1',
                'title': 'Important Information',
                'type': 'paragraphContent',
                'content': 'We are glad you are coming to Fall Retreat!'
              },
              {
                'id': 'block-2',
                'title': 'What\'s your name?',
                'required': true,
                'type': 'nameQuestion'
              },
              {
                'id': 'block-3',
                'title': 'What school do you currently attend?',
                'type': 'textQuestion'
              },
              {
                'id': 'block-4',
                'title': 'Man or Lady?',
                'type': 'radioQuestion',
                'required': true,
                'choices': [
                  'Man',
                  'Lady'
                ]
              }
            ]
          },
          {
            'id': '2',
            'title': 'Rides',
            'blocks': [
              {
                'id': 'block-1',
                'title': 'Ride Situation',
                'type': 'paragraphContent',
                'content': 'If you are driving, please give someone a ride.'
              },
              {
                'id': 'block-5',
                'title': 'Do you have a car?',
                'type': 'radioQuestion',
                'required': true,
                'choices': [
                  'Yes',
                  'No'
                ]
              },
              {
                'id': 'block-6',
                'title': 'Do you need a ride?',
                'type': 'radioQuestion',
                'required': true,
                'choices': [
                  'Yes',
                  'No'
                ]
              }
            ]
          },
          {
            'id': '3',
            'title': 'Food',
            'blocks': [
              {
                'id': 'block-7',
                'title': 'What do you want to eat for breakfast?',
                'type': 'radioQuestion',
                'required': true,
                'choices': [
                  'Pancakes',
                  'Waffles',
                  'Omelettes'
                ]
              },
              {
                'id': 'block-8',
                'title': 'What do you want to eat for lunch?',
                'type': 'radioQuestion',
                'required': true,
                'choices': [
                  'Sandwich',
                  'Soup',
                  'Burger'
                ]
              },
              {
                'id': 'block-9',
                'title': 'What do you want to eat for dinner?',
                'type': 'radioQuestion',
                'required': true,
                'choices': [
                  'Steak',
                  'Shrimp',
                  'Lobster'
                ]
              }
            ]
          }
        ]
      },
      {
        'id': '123',
        'name': 'Fall Retreat WOOO'
      },
      {
        'id': '234',
        'name': 'Fall Retreat!'
      },
      {
        'id': '345',
        'name': 'Yet Another Fall Retreat (YAFR)'
      },
      {
        'id': '456',
        'name': 'Fall Retreat Is Never Gonna Give You Up'
      }
    ];

    $httpBackend.whenGET('conferences').respond(function () {
      console.log(arguments);
      var headers = {};
      return [200, conferences, headers];
    });
    $httpBackend.whenPOST('conferences').respond(function (verb, url, data) {
      console.log(arguments);

      var conference = angular.extend(angular.fromJson(data), { id: uuid() });

      var headers = {
        'Location': '/conferences/' + conference.id
      };
      return [201, conference, headers];
    });
    $httpBackend.whenGET(/^conferences\/[-a-zA-Z0-9]+\/?$/).respond(function (verb, url) {
      console.log(arguments);

      var conferenceId = url.split('/')[1];

      var conference = _.find(conferences, function (conference) {
        return angular.equals(conference.id, conferenceId);
      });

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

      var conferenceId = url.split('/')[1];

      var registration = {
        id: uuid(),
        conference: conferenceId,
        answers: []
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
      if(registrationId) {
        return [200, sessionStorage.getItem('/registrations/' + registrationId)];
      }

      return [404];
    });
    $httpBackend.whenGET(/^registrations\/[-a-zA-Z0-9]+\/?$/).respond(function (verb, url) {
      console.log(arguments);

      var registrationId = url.split('/')[1];
      var registration = sessionStorage.getItem('/registrations/' + registrationId);
      if(registration) {
        return [200, registration];
      }

      return [404];
    });

    $httpBackend.whenPUT(/^answers\/[-a-zA-Z0-9]+\/?$/).respond(function (verb, url, data) {
      console.log(arguments);
      var answer = angular.fromJson(data);

      if(!answer.registration) {
        return [400, { message: 'registration must be present' }];
      }
      if(!answer.block) {
        return [400, { message: 'block must be present' }];
      }
      if(!answer.value) {
        return [400, { message: 'value must be present' }];
      }
      if(!answer.id) {
        answer.id = uuid();
      }

      var registration = sessionStorage.getItem('/registrations/' + data.registration);
      if(registration) {
        var answers = registration.answers;
        var existingAnswerIndex = _.findIndex(answers, { block: answer.block });
        if(existingAnswerIndex != -1) {
          answers.splice(existingAnswerIndex, 1);
        }
        answers.push(answer);
      }

      return [200, answer];
    });

    /*
    angular.forEach(conferences, function (conference) {
      $httpBackend.whenGET('conferences/' + conference.id).respond(function () {
        console.log(arguments);

        var headers = {};
        return [200, conference, headers];
      });

      $httpBackend.whenGET('conferences/' + conference.id + '/registrations').respond(function () {
        console.log(arguments);

        var headers = {};
        return [200, registrations[conference.id], headers];
      });

      $httpBackend.whenPOST('conferences/' + conference.id + '/registrations').respond(function () {
        console.log(arguments);

        var registration = {
          id: '752bab92-e8bf-11e2-91e2-0800200c9a66',
          user: 'c8cfaf61-e8a8-11e2-91e2-0800200c9a66',
          answers: []
        };

        var headers = {
          location: 'registrations/' + registration.id
        };
        return [201, registrations[conference.id], headers];
      });

      $httpBackend.whenGET('conferences/' + conference.id + '/registrations/current').respond(function () {
        console.log(arguments);

        var headers = {};
        var regForConf = registrations[conference.id];
        var theReg = _.find(regForConf, function (registration) {
          return angular.equals(registration.user, 'user-1');
        });
        console.log(theReg);
        return [200, theReg, headers];
      });
    });
    */
  });
