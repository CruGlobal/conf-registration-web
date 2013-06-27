'use strict';

angular.module('confRegistrationWebApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/register/:conferenceId', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl',
        resolve: {
          conference: function (Conferences, $route) {
            return Conferences.getById($route.current.params.conferenceId); // todo handle a not found conference
          }
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  });
