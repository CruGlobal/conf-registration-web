'use strict';

angular.module('confRegistrationWebApp', ['ngMockE2E', 'ngResource'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/register/:conferenceId/page/:pageId', {
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl',
        resolve: {
          conference: ['$route', 'Conferences', '$q', function ($route, Conferences, $q) {
            var defer = $q.defer();

            Conferences.get({id: $route.current.params.conferenceId}, function (data) {
              defer.resolve(data);
            });

            return defer.promise;
          }]
        }
      })
      .when('/info/:conferenceId', {
        templateUrl: 'views/info.html',
        controller: 'InfoCtrl',
        resolve: {
          conference: ['$route', 'Conferences', '$q', function ($route, Conferences, $q) {
            var defer = $q.defer();

            Conferences.get({id: $route.current.params.conferenceId}, function (data) {
              defer.resolve(data);
            });

            return defer.promise;
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  });
