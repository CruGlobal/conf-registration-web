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
      .when('/approvePayment/:paymentHash', {
        templateUrl: 'views/paymentApproval.html',
        controller: 'PaymentApprovalCtrl',
        resolve: {
          enforceAuth: $injector.get('enforceAuth')
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
            var visibleBlocks = localStorage.getItem('visibleBlocks:' + $route.current.params.conferenceId);
            if(!_.isNull(visibleBlocks)){
              visibleBlocks = JSON.parse(visibleBlocks);
            }
            return RegistrationCache.getAllForConference($route.current.params.conferenceId, visibleBlocks);
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
      .when('/eventUsers/:conferenceId', {
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
        controller: 'activatePermissionCtrl',
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
                  $location.path($cookies.intendedRoute || '/').search('regType', $cookies.regType).replace();
                  delete $cookies.regType;
                } else {
                  $location.path($cookies.intendedRoute || '/').replace();
                }
              });
            }
          ]
        }
      })
      .when('/logout/', {
        resolve: {
          redirect: ['$location', '$cookies', '$window', '$http', '$facebook',
            function ($location, $cookies, $window, $http, $facebook) {

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
                $http.get('auth/facebook/logout').success(function () {
                  delete $cookies.crsAuthProviderType;
                  delete $cookies.crsPreviousToken;
                  delete $cookies.crsToken;

                  $facebook.logout().then(function(){
                    $location.url('/#');
                  });

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
        controller: 'helpCtrl'
      })
      .when('/privacy/', {
        templateUrl: 'views/privacy.html',
        controller: 'helpCtrl'
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

    $rootScope.$on('$routeChangeSuccess', function () {
      //scroll to top of page when new page is loaded
      $window.scrollTo(0, 0);

      //Google Analytics
      $window.ga('send', 'pageview', {'page': $location.path()});
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
  })
  .run(function () {
    window.fbAsyncInit = function() {
      FB.init({
        appId      : '217890171695297',
        xfbml      : true,
        version    : 'v2.2'
      });
    };

    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  })
  .config( function( $facebookProvider ) {
    $facebookProvider.setAppId('217890171695297');
  });
