import landingTemplate from 'views/landing.html';
import registrationTemplate from 'views/registration.html';
import paymentApprovalTemplate from 'views/paymentApproval.html';
import reviewRegistrationTemplate from 'views/reviewRegistration.html';
import eventDashboardTemplate from 'views/eventDashboard.html';
import eventOverviewTemplate from 'views/eventOverview.html';
import eventRegistrationsTemplate from 'views/eventRegistrations.html';
import eventFormTemplate from 'views/eventForm.html';
import eventDetailsTemplate from 'views/eventDetails.html';
import eventPermissionsTemplate from 'views/eventPermissions.html';
import helpTemplate from 'views/help.html';
import privacyTemplate from 'views/privacy.html';

angular.module('confRegistrationWebApp')
  .config(function ($locationProvider, $httpProvider, $qProvider, $routeProvider) {
    $locationProvider.html5Mode(true).hashPrefix('');
    $httpProvider.useApplyAsync(true);
    $qProvider.errorOnUnhandledRejections(false);

    $routeProvider
      .when('/', {
        templateUrl: landingTemplate,
        controller: 'landingCtrl'
      })
      .when('/register/:conferenceId', {
        resolve: {
          redirect: function ($location, $route) {
            $location.path('/register/' + $route.current.params.conferenceId + '/page/');
          }
        }
      })
      .when('/register/:conferenceId/page/:pageId?', {
        templateUrl: registrationTemplate,
        controller: 'RegistrationCtrl',
        authorization: {
          requireLogin: true,
          allowNoneAuth: true
        },
        resolve: {
          conference: function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          },
          currentRegistration: function ($route, $q, $location, RegistrationCache) {
            var q = $q.defer();
            RegistrationCache.getCurrent($route.current.params.conferenceId).then(function(registration){
              if(registration.completed && angular.isUndefined($route.current.params.pageId)){
                $location.path('/reviewRegistration/' + $route.current.params.conferenceId);
              }else{
                q.resolve(registration);
              }
            });
            return q.promise;
          }
        }
      })
      .when('/approvePayment/:paymentHash', {
        templateUrl: paymentApprovalTemplate,
        controller: 'PaymentApprovalCtrl',
        authorization: {
          requireLogin: true
        }
      })
      .when('/reviewRegistration/:conferenceId', {
        templateUrl: reviewRegistrationTemplate,
        controller: 'ReviewRegistrationCtrl',
        authorization: {
          requireLogin: true,
          allowNoneAuth: true
        },
        resolve: {
          currentRegistration: function ($route, RegistrationCache) {
            RegistrationCache.emptyCache();
            return RegistrationCache.getCurrent($route.current.params.conferenceId)
              .then(function (currentRegistration) {
                return currentRegistration;
              });
          },
          conference: function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          }
        }
      })
      .when('/preview/:conferenceId/page/:pageId?', {
        templateUrl: registrationTemplate,
        controller: 'RegistrationCtrl',
        authorization: {
          requireLogin: true
        },
        resolve: {
          conference: function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          },
          currentRegistration: function ($route, RegistrationCache) {
            return RegistrationCache.getCurrent($route.current.params.conferenceId);
          }
        }
      })
      .when('/eventDashboard', {
        templateUrl: eventDashboardTemplate,
        controller: 'eventDashboardCtrl',
        authorization: {
          requireLogin: true
        },
        resolve: {
          conferences: function ($route, ConfCache) {
            return ConfCache.get('');
          }
        }
      })
      .when('/eventOverview/:conferenceId', {
        templateUrl: eventOverviewTemplate,
        controller: 'eventOverviewCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'VIEW'
        },
        resolve: {
          conference: function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          }
        }
      })
      .when('/eventRegistrations/:conferenceId', {
        templateUrl: eventRegistrationsTemplate,
        controller: 'eventRegistrationsCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'VIEW'
        },
        resolve: {
          conference: function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          },
          permissions: function ($route, PermissionCache) {
            return PermissionCache.getForConference($route.current.params.conferenceId);
          }
        }
      })
      .when('/eventForm/:conferenceId', {
        templateUrl: eventFormTemplate,
        controller: 'eventFormCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'UPDATE'
        },
        resolve: {
          conference: function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          }
        }
      })
      .when('/eventDetails/:conferenceId', {
        templateUrl: eventDetailsTemplate,
        controller: 'eventDetailsCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'UPDATE'
        },
        resolve: {
          conference: function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          }
        }
      })
      .when('/eventUsers/:conferenceId', {
        templateUrl: eventPermissionsTemplate,
        controller: 'eventPermissionsCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'FULL'
        },
        resolve: {
          conference: function ($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          },
          conferencePermissions: function ($route, ConfCache) {
            return ConfCache.getPermissions($route.current.params.conferenceId);
          }
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
              $cookies.put('crsAuthProviderType', '');
              $cookies.put('crsToken', $route.current.params.token);
              $rootScope.crsToken = $cookies.get('crsToken');
              ProfileCache.getCache(function (data) {
                $cookies.put('crsAuthProviderType', data.authProviderType);
                if(angular.isDefined($cookies.get('regType'))) {
                  $location.path($cookies.get('intendedRoute') || '/').search('regType', $cookies.get('regType')).replace();
                  $cookies.remove('regType');
                } else {
                  $location.path($cookies.get('intendedRoute') || '/').replace();
                }
              });
            }
          ]
        }
      })
      .when('/logout', {
        resolve: {
          redirect: ['$location', '$cookies', '$window', '$http', '$facebook',
            function ($location, $cookies, $window, $http, $facebook) {
              $http.get('auth/logout').then(function() {
                $cookies.remove('crsToken');

                /* if facebook, then use the FB JavaScript SDK to log out user from FB */
                if ($cookies.get('crsAuthProviderType') === 'FACEBOOK') {
                  $facebook.logout().then(function () {
                    $cookies.remove('crsAuthProviderType');
                    $location.url('/');
                  });
                /* if relay, then then redirect to the Relay logout URL w/ service to bring user
                 * back to ERT home page */
                } else if ($cookies.get('crsAuthProviderType') === 'RELAY') {
                  $cookies.remove('crsAuthProviderType');
                  var serviceUrl = $location.absUrl().replace('logout', '');
                  $window.location.href = 'https://signin.cru.org/cas/logout?service=' + serviceUrl;
                /* for no auth logins, nothing further is needed, back to ERT home page */
                } else {
                  $cookies.remove('crsAuthProviderType');
                  $location.url('/');
                }
              }).catch(function () {
                $location.url('/');
              });
            }
          ]
        }
      })
      .when('/help', {
        templateUrl: helpTemplate,
        controller: 'helpCtrl'
      })
      .when('/privacy', {
        templateUrl: privacyTemplate,
        controller: 'helpCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function ($rootScope, $cookies, $location, $window, ProfileCache) {
    // eslint-disable-next-line angular/on-watch
    $rootScope.$on('$locationChangeStart', function () {
      //registration mode
      if (_.includes($location.path(), '/preview/')) {
        $rootScope.registerMode = 'preview';
      } else if(_.includes($location.path(), '/register/')) {
        $rootScope.registerMode = 'register';
      }
    });

    // eslint-disable-next-line angular/on-watch
    $rootScope.$on('$routeChangeSuccess', function () {
      //scroll to top of page when new page is loaded
      $window.scrollTo(0, 0);

      //Google Analytics
      if($window.ga){
        $window.ga('send', 'pageview', {'page': $location.path()});
      }
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
  .config(function (envServiceProvider, $compileProvider) {
    envServiceProvider.config({
      domains: {
        development: ['localhost'],
        staging: ['stage.eventregistrationtool.com'],
        production: ['www.eventregistrationtool.com']
      },
      vars: {
        development: {
          apiUrl: 'https://api.stage.eventregistrationtool.com/eventhub-api/rest/',
          tsysEnvironment: 'staging'
        },
        staging: {
          apiUrl: 'https://api.stage.eventregistrationtool.com/eventhub-api/rest/',
          tsysEnvironment: 'production'
        },
        production: {
          apiUrl: 'https://api.eventregistrationtool.com/eventhub-api/rest/',
          tsysEnvironment: 'production'
        }
      }
    });

    // Determine which environment we are running in
    envServiceProvider.check();

    if (envServiceProvider.is('production') || envServiceProvider.is('staging')) {
      $compileProvider.debugInfoEnabled(false);
    }
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
