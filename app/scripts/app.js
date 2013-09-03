'use strict';

angular.module('confRegistrationWebApp', ['ngResource', 'ngCookies', 'ui.bootstrap'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/admin-dashboard.html',
        controller: 'MainCtrl',
        resolve: {
          enforceAuth: 'enforceAuth'
        }
      })
      .when('/wizard/:conferenceId', {
        templateUrl: 'views/admin-wizard.html',
        controller: 'AdminWizardCtrl',
        resolve: {
          enforceAuth: 'enforceAuth',
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }]
        }
      })
      .when('/register/:conferenceId/page/:pageId', {
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl',
        resolve: {
          enforceAuth: 'enforceAuth',
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
          enforceAuth: 'enforceAuth',
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
          enforceAuth: 'enforceAuth',
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
          enforceAuth: 'enforceAuth',
          answers: ['$route', 'RegistrationCache', function ($route, RegistrationCache) {
            return RegistrationCache.getCurrent($route.current.params.conferenceId)
              .then(function (currentRegistration) {
                return currentRegistration.answers;
              });
          }],
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }]
        }
      })
      .when('/auth/:token', {
        resolve: {
          redirectToIntendedRoute: ['$location', '$cookies', '$route', function ($location, $cookies, $route) {
            $cookies.crsToken = $route.current.params.token;
            $location.replace().path($cookies.intendedRoute || '/');
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function ($rootScope, $cookies, $location) {
    $rootScope.$on('$locationChangeStart', function () {
      if (!/^\/auth\/.*/.test($location.url())) {
        $cookies.intendedRoute = $location.url();
      }
    });

  })
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('currentRegistrationInterceptor');
    $httpProvider.interceptors.push('httpUrlInterceptor');
    $httpProvider.interceptors.push('authorizationInterceptor');
    $httpProvider.interceptors.push('unauthorizedInterceptor');
    $httpProvider.interceptors.push('debouncePutsInterceptor');
  })
  .run(function ($rootScope, $location) {
    $rootScope.location = $location;
    $rootScope.$watch('location.url()', function (newVal) {
      $rootScope.adminDashboard = angular.equals(newVal, '/');
      $rootScope.subHeadStyle = {
        height: $rootScope.adminDashboard ? '100px' : '5px'
      };
    });
  });
