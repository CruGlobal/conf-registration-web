'use strict';
angular.module('confRegistrationWebApp', ['ngRoute', 'ngResource', 'ngCookies', 'ui.bootstrap'])
  .config(function ($routeProvider, $injector) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/landing.html',
        controller: 'landingCtrl'
      })
      .when('/register/:conferenceId', {
        resolve: {
          redirectToIntendedRoute: ['$location', '$route', function ($location, $route) {
            $location.replace().path('/register/' + $route.current.params.conferenceId + '/page/');
          }]
        }
      })
      .when('/register/:conferenceId/page/:pageId?', {
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth'),
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }],
          currentRegistration: ['$route', 'RegistrationCache', function ($route, RegistrationCache) {
            return RegistrationCache.getCurrent($route.current.params.conferenceId);
          }]
        }
      })
      .when('/payment/:conferenceId', {
        templateUrl: 'views/payment.html',
        controller: 'paymentCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth'),
          registration: ['$route', 'RegistrationCache', function ($route, RegistrationCache) {
            return RegistrationCache.getCurrent($route.current.params.conferenceId)
              .then(function (currentRegistration) {
                return currentRegistration;
              });
          }],
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }]
        }
      })
      .when('/reviewRegistration/:conferenceId', {
        templateUrl: 'views/reviewRegistration.html',
        controller: 'ReviewRegistrationCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth'),
          registration: ['$route', 'RegistrationCache', function ($route, RegistrationCache) {
            return RegistrationCache.getCurrent($route.current.params.conferenceId)
              .then(function (currentRegistration) {
                return currentRegistration;
              });
          }],
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }]
        }
      })
      .when('/preview/:conferenceId/page/:pageId?', {
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth'),
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }],
          currentRegistration: ['$route', 'RegistrationCache', function ($route, RegistrationCache) {
            return RegistrationCache.getCurrent($route.current.params.conferenceId);
          }]
        }
      })
      .when('/eventDashboard', {
        templateUrl: 'views/eventDashboard.html',
        controller: 'eventDashboardCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth')
        }
      })
      .when('/eventOverview/:conferenceId', {
        templateUrl: 'views/eventOverview.html',
        controller: 'eventOverviewCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth'),
          registrations: ['$route', 'RegistrationCache', function ($route, RegistrationCache) {
            return RegistrationCache.getAllForConference($route.current.params.conferenceId);
          }],
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }],
          permissions: ['$route', 'PermissionCache', function ($route, PermissionCache) {
            return PermissionCache.getForConference($route.current.params.conferenceId);
          }]
        }
      })
      .when('/eventRegistrations/:conferenceId', {
        templateUrl: 'views/eventRegistrations.html',
        controller: 'eventRegistrationsCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth'),
          registrations: ['$route', 'RegistrationCache', function ($route, RegistrationCache) {
            return RegistrationCache.getAllForConference($route.current.params.conferenceId);
          }],
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }],
          permissions: ['$route', 'PermissionCache', function ($route, PermissionCache) {
            return PermissionCache.getForConference($route.current.params.conferenceId);
          }]
        }
      })
      .when('/eventForm/:conferenceId', {
        template: '<ng-include src="templateUrl"></ng-include>',
        controller: 'eventFormCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth'),
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }],
          permissions: ['$route', 'PermissionCache', function ($route, PermissionCache) {
            return PermissionCache.getForConference($route.current.params.conferenceId);
          }]
        }
      })
      .when('/eventDetails/:conferenceId', {
        template: '<ng-include src="templateUrl"></ng-include>',
        controller: 'eventDetailsCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth'),
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }],
          permissions: ['$route', 'PermissionCache', function ($route, PermissionCache) {
            return PermissionCache.getForConference($route.current.params.conferenceId);
          }]
        }
      })
      .when('/eventPermissions/:conferenceId', {
        template: '<ng-include src="templateUrl"></ng-include>',
        controller: 'eventPermissionsCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth'),
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }],
          permissions: ['$route', 'PermissionCache', function ($route, PermissionCache) {
            return PermissionCache.getForConference($route.current.params.conferenceId);
          }]
        }
      })
      .when('/activatePermission/:permissionAuthCode', {
        template: '{{message}}',
        controller: 'ActiviatePermissionCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth')
        }
      })
      .when('/auth/:token', {
        resolve: {
          redirectToIntendedRoute: ['$location', '$cookies', '$route', '$rootScope', 'ProfileCache',
            function ($location, $cookies, $route, $rootScope, ProfileCache) {
              $cookies.crsAuthProviderType = '';
              if ($cookies.crsToken && ($cookies.crsToken !== $route.current.params.token)) {
                $cookies.crsPreviousToken = $cookies.crsToken;
              }
              $cookies.crsToken = $route.current.params.token;
              $rootScope.crsToken = $cookies.crsToken;
              ProfileCache.getCache(function (data) {
                $cookies.crsAuthProviderType = data.authProviderType;
                $location.replace().path($cookies.intendedRoute || '/');
              });
            }
          ]
        }
      })
      .when('/logout/', {
        resolve: {
          redirectToIntendedRoute: ['$location', '$cookies', '$window',
            function ($location, $cookies, $window) {
              var crsAuthProviderTypeBackup = $cookies.crsAuthProviderType;
              delete $cookies.crsAuthProviderType;
              delete $cookies.crsPreviousToken;
              delete $cookies.crsToken;

              if(crsAuthProviderTypeBackup  === 'RELAY') {
                  $window.location.href = 'https://signin.cru.org/cas/logout?logoutCallbackUrl=https://stage.eventregistrationtool.com/'
              }
              $location.path('/');
            }
          ]
        }
      })
      .when('/help/', {
        templateUrl: 'views/help.html',
        controller: 'landingCtrl'
      })
      .when('/privacy/', {
        templateUrl: 'views/privacy.html',
        controller: 'landingCtrl'
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

      //registration mode
      if ($location.path().indexOf('/preview/') !== -1 && $rootScope.registerMode !== 'preview') {
        $rootScope.clearRegCache = true;
      } else if ($location.path().indexOf('/register/') !== -1 && $rootScope.registerMode !== 'register') {
        $rootScope.clearRegCache = true;
      }
      if ($location.path().indexOf('/preview/') !== -1) { $rootScope.registerMode = 'preview'; }
      if ($location.path().indexOf('/register/') !== -1) { $rootScope.registerMode = 'register'; }
    });

    $rootScope.generateTitle = function (title) {
      if (title) {
        return title + ' | Event Registration Tool';
      } else {
        return 'Event Registration Tool';
      }
    };
  })
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('currentRegistrationInterceptor');
    $httpProvider.interceptors.push('httpUrlInterceptor');
    $httpProvider.interceptors.push('authorizationInterceptor');
    $httpProvider.interceptors.push('unauthorizedInterceptor');
    $httpProvider.interceptors.push('debouncePutsInterceptor');
    $httpProvider.interceptors.push('statusInterceptor');
  });
