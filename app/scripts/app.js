'use strict';

angular.module('confRegistrationWebApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/register/:conferenceId', {
        controller: 'RegisterCtrl',
        template: '',
        resolve: {
          conference: function (Conferences, $route) {
            return Conferences.getById($route.current.params.conferenceId); // todo handle a not found conference
          }
        }
      })
      .when('/register/:conferenceId/page/:pageId', {
        templateUrl: 'views/page.html',
        controller: 'PageCtrl',
        resolve: {
          conference: function ($route, Conferences) {
            return Conferences.getById($route.current.params.conferenceId); // todo handle a not found conference
          }
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  });
