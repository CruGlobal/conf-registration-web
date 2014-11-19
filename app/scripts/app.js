'use strict';
angular.module('confRegistrationWebApp', ['ngRoute', 'ngCookies', 'ui.bootstrap', 'ui.sortable', 'wysiwyg.module'])
  .config(function ($routeProvider, $injector) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/landing.html',
        controller: 'landingCtrl'
      })
      .when('/register/:conferenceId', {
        resolve: {
          redirect: ['$location', '$route', function ($location, $route) {
            $location.path('/register/' + $route.current.params.conferenceId + '/page/');
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
            RegistrationCache.emptyCache();
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
                if(angular.isDefined($cookies.regType)) {
                  $location.path($cookies.intendedRoute || '/').search('regType', $cookies.regType);
                  delete $cookies.regType;
                } else {
                  $location.path($cookies.intendedRoute || '/');
                }
              });
            }
          ]
        }
      })
      .when('/logout/', {
        resolve: {
          redirect: ['$location', '$cookies', '$window', '$http',
            function ($location, $cookies, $window, $http) {

              /* if RELAY log out, delete the cookies first and then redirect.  cookies must be deleted
               * first b/c the browser is being redirected and will not come back here.  the auth token
               * is not needed server side before logging out */
              if ($cookies.crsAuthProviderType  === 'RELAY') {
                delete $cookies.crsAuthProviderType;
                delete $cookies.crsPreviousToken;
                delete $cookies.crsToken;
                // make sure we come back to home page, not logout page
                var serviceUrl = $location.absUrl().replace('logout','');
                $window.location.href = 'https://signin.cru.org/cas/logout?service=' + serviceUrl;
                /* if FACEBOOK log out, issue an async GET to retrieve the log out URL from the API
                 * the cookies cannot be deleted first b/c the auth token is needed to access the session & identity
                 * server side so the users access_token can be fetched to build the log out URL.
                 * after the GET, if successful, then delete the cookies. */
              } else if ($cookies.crsAuthProviderType === 'FACEBOOK') {
                $http.get('/auth/facebook/logout').success(function (data, status, headers) {
                  delete $cookies.crsAuthProviderType;
                  delete $cookies.crsPreviousToken;
                  delete $cookies.crsToken;
                  $window.location.href = headers('X-Facebook-Logout-URL');
                }).error(function (data, status) {
                  alert('Logout failed: ' + status);
                });
              } else {
                delete $cookies.crsAuthProviderType;
                delete $cookies.crsPreviousToken;
                delete $cookies.crsToken;
                $location.url('/#');
              }
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
  .run(function ($rootScope, $cookies, $location, $window) {
    $rootScope.$on('$locationChangeStart', function () {
      //registration mode
      if (_.contains($location.path(), '/preview/')) {
        $rootScope.registerMode = 'preview';
      } else if(_.contains($location.path(), '/register/')) {
        $rootScope.registerMode = 'register';
      }
    });

    $rootScope.generateTitle = function (title) {
      if (title) {
        return title + ' | Event Registration Tool';
      } else {
        return 'Event Registration Tool';
      }
    };

    //Google Analytics
    $rootScope.$on('$routeChangeSuccess', function(){
      $window.ga('send', 'pageview', {'page': $location.path()});
    });
  })
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('currentRegistrationInterceptor');
    $httpProvider.interceptors.push('httpUrlInterceptor');
    $httpProvider.interceptors.push('authorizationInterceptor');
    $httpProvider.interceptors.push('unauthorizedInterceptor');
    $httpProvider.interceptors.push('debouncePutsInterceptor');
    $httpProvider.interceptors.push('statusInterceptor');
  })
  .config(function ($provide) {
    $provide.decorator('$exceptionHandler', ['$delegate', function ($delegate) {
      return function (exception) {
        $delegate(exception);
        if (_.contains(['localhost'], location.hostname)) {
          return;
        }
        var error = {
          type: 'Angular',
          message: exception.message,
          params: {
            angularVersion: angular.version.full
          },
          component: exception.stack
        };
        Hoptoad.notify(error);
      };
    }]);
  });
