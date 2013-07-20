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
          }],
          answers: ['$route', 'Registrations', '$q', function ($route, Registrations) {
            return Registrations.getCurrentOrCreate($route.current.params.conferenceId).then(function (registration) {
              return registration.answers;
            });
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
      .when('/adminData/:conferenceId', {
        templateUrl: 'views/adminData.html',
        controller: 'AdminDataCtrl',
        resolve: {
          registrations: ['$route', 'Registrations', '$q', function ($route, Registrations, $q) {
            var defer = $q.defer();
            Registrations.getAllForConference({ conferenceId: $route.current.params.conferenceId }, defer.resolve);
            return defer.promise;
          }],
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
  })
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('currentRegistrationInterceptor');
  });
