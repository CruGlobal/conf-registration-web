'use strict';

angular.module('confRegistrationWebApp')
  .factory('Conferences', function () {
    var conferences = [
      {
        'id': '012',
        'name': 'A Sweet Fall Retreat',
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
                'type': 'textQuestion'
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
                'id': 'block-4',
                'title': 'Do you have a car?',
                'type': 'radioQuestion',
                'required': true,
                'choices': [
                  'Yes',
                  'No'
                ]
              },
              {
                'id': 'block-4',
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
                'id': 'block-4',
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
                'id': 'block-4',
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
                'id': 'block-4',
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
