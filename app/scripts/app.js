'use strict';

angular.module('confRegistrationWebApp', ['ngResource', 'ui.bootstrap'])
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
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
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
      .when('/register/:conferenceId', {
        resolve: {
          redirectToRegistration: ['$route', 'ConfCache', '$location', function ($route, ConfCache, $location) {
            var conferenceId = $route.current.params.conferenceId;
            ConfCache.get(conferenceId).then(function (conference) {
              var firstPageId = conference.registrationPages &&
                conference.registrationPages[0] &&
                conference.registrationPages[0].id;
              $location.replace().path('/register/' + conferenceId + '/page/' + firstPageId);
            });
          }]
        }
      })
      .when('/reviewRegistration/:conferenceId', {
        templateUrl: 'views/reviewRegistration.html',
        controller: 'ReviewRegistrationCtrl',
        resolve: {
          answers: ['$route', 'Registrations', '$q', function ($route, Registrations) {
            return Registrations.getCurrentOrCreate($route.current.params.conferenceId).then(function (registration) {
              return registration.answers;
            });
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
    $httpProvider.interceptors.push('httpUrlInterceptor');
  });
