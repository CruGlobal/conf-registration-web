'use strict';
angular.module('confRegistrationWebApp', ['ngRoute', 'ngCookies', 'ngSanitize', 'ngFacebook', 'ui.bootstrap', 'ui.tree', 'wysiwyg.module'])
  .config(function ($routeProvider) {
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
        authorization: {
          requireLogin: true,
          allowNoneAuth: true
        },
        resolve: {
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }],
          currentRegistration: ['$route', '$q', '$location', 'RegistrationCache', function ($route, $q, $location, RegistrationCache) {
            var q = $q.defer();
            RegistrationCache.getCurrent($route.current.params.conferenceId).then(function(registration){
              if(registration.completed && angular.isUndefined($route.current.params.pageId)){
                $location.path('/reviewRegistration/' + $route.current.params.conferenceId);
              }else{
                q.resolve(registration);
              }
            });
            return q.promise;
          }]
        }
      })
      .when('/approvePayment/:paymentHash', {
        templateUrl: 'views/paymentApproval.html',
        controller: 'PaymentApprovalCtrl',
        authorization: {
          requireLogin: true
        }
      })
      .when('/reviewRegistration/:conferenceId', {
        templateUrl: 'views/reviewRegistration.html',
        controller: 'ReviewRegistrationCtrl',
        authorization: {
          requireLogin: true,
          allowNoneAuth: true
        },
        resolve: {
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
        authorization: {
          requireLogin: true
        },
        resolve: {
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
        authorization: {
          requireLogin: true
        },
        resolve: {
          conferences: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get('');
          }]
        }
      })
      .when('/eventOverview/:conferenceId', {
        templateUrl: 'views/eventOverview.html',
        controller: 'eventOverviewCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'VIEW'
        },
        resolve: {
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          }]
        }
      })
      .when('/eventRegistrations/:conferenceId', {
        templateUrl: 'views/eventRegistrations.html',
        controller: 'eventRegistrationsCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'VIEW'
        },
        resolve: {
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          }],
          permissions: ['$route', 'PermissionCache', function ($route, PermissionCache) {
            return PermissionCache.getForConference($route.current.params.conferenceId);
          }]
        }
      })
      .when('/eventForm/:conferenceId', {
        templateUrl: 'views/eventForm.html',
        controller: 'eventFormCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'UPDATE'
        },
        resolve: {
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          }]
        }
      })
      .when('/eventDetails/:conferenceId', {
        templateUrl: 'views/eventDetails.html',
        controller: 'eventDetailsCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'UPDATE'
        },
        resolve: {
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          }]
        }
      })
      .when('/eventUsers/:conferenceId', {
        templateUrl: 'views/eventPermissions.html',
        controller: 'eventPermissionsCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'FULL'
        },
        resolve: {
          conference: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }],
          conferencePermissions: ['$route', 'ConfCache', function ($route, ConfCache) {
            return ConfCache.getPermissions($route.current.params.conferenceId);
          }]
        }
      })
      .when('/activatePermission/:permissionAuthCode', {
        template: '{{message}}',
        controller: 'activatePermissionCtrl',
        authorization: {
          requireLogin: true
        }
      })
      .when('/auth/:token', {
        resolve: {
          redirectToIntendedRoute: ['$location', '$cookies', '$route', '$rootScope', 'ProfileCache',
            function ($location, $cookies, $route, $rootScope, ProfileCache) {
              $cookies.crsAuthProviderType = '';
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
              $http.get('auth/logout').success(function() {
                delete $cookies.crsToken;

                /* if facebook, then use the FB JavaScript SDK to log out user from FB */
                if ($cookies.crsAuthProviderType === 'FACEBOOK') {
                  $facebook.logout().then(function () {
                    delete $cookies.crsAuthProviderType;
                    $location.url('/');
                  });
                /* if relay, then then redirect to the Relay logout URL w/ service to bring user
                 * back to ERT home page */
                } else if ($cookies.crsAuthProviderType  === 'RELAY') {
                  delete $cookies.crsAuthProviderType;
                  var serviceUrl = $location.absUrl().replace('logout', '');
                  $window.location.href = 'https://signin.cru.org/cas/logout?service=' + serviceUrl;
                /* for no auth logins, nothing further is needed, back to ERT home page */
                } else {
                  delete $cookies.crsAuthProviderType;
                  $location.url('/');
                }
              }).error(function (data, status) {
                alert('Logout failed: ' + status);
              });
            }
          ]
        }
      })
      .when('/help', {
        templateUrl: 'views/help.html',
        controller: 'helpCtrl'
      })
      .when('/privacy', {
        templateUrl: 'views/privacy.html',
        controller: 'helpCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function ($rootScope, $cookies, $location, $window, ProfileCache) {
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

    $rootScope.globalGreetingName = function(){
      return ProfileCache.globalGreetingName();
    };
    ProfileCache.getCache();
  })
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('currentRegistrationInterceptor');
    $httpProvider.interceptors.push('httpUrlInterceptor');
    $httpProvider.interceptors.push('authorizationInterceptor');
    $httpProvider.interceptors.push('unauthorizedInterceptor');
    $httpProvider.interceptors.push('statusInterceptor');
  })
  .run(function () {
    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = '//connect.facebook.net/en_US/all.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  })
  .config( function( $facebookProvider ) {
    $facebookProvider.setAppId('217890171695297');
  });
