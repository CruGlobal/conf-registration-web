'use strict';

angular.module('confRegistrationWebApp', ['ngMockE2E', 'ngResource'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/admin-dashboard.html',
        controller: 'MainCtrl'
      })
      .when('/wizard/:conferenceId', {
        templateUrl: 'views/admin-wizard.html',
        controller: 'AdminWizardCtrl',
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
      .when('/register/:conferenceId/page/:pageId', {
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl',
        resolve: {
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }],
          currentRegistration: ['$route', 'RegistrationCache', function ($route, RegistrationCache) {
            return RegistrationCache.getCurrent($route.current.params.conferenceId);
          }]
        }
      })
      .when('/info/:conferenceId', {
        templateUrl: 'views/info.html',
        controller: 'InfoCtrl',
        resolve: {
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }]
        }
      })
      .when('/adminData/:conferenceId', {
        templateUrl: 'views/adminData.html',
        controller: 'AdminDataCtrl',
        resolve: {
          registrations: ['$route', 'RegistrationCache', function ($route, RegistrationCache) {
            return RegistrationCache.getAllForConference($route.current.params.conferenceId);
          }],
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
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
