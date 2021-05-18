import landingTemplate from 'views/landing.html';
import registrationTemplate from 'views/registration.html';
import paymentApprovalTemplate from 'views/paymentApproval.html';
import reviewRegistrationTemplate from 'views/reviewRegistration.html';
import eventDashboardTemplate from 'views/eventDashboard.html';
import eventOverviewTemplate from 'views/eventOverview.html';
import eventRegistrationsTemplate from 'views/eventRegistrations.html';
import paymentCashCheckReportTemplate from 'views/paymentCashCheckReport.html';
import journalUploadTemplate from 'views/journalUpload.html';
import eventFormTemplate from 'views/eventForm.html';
import eventDetailsTemplate from 'views/eventDetails.html';
import eventPermissionsTemplate from 'views/eventPermissions.html';
import helpTemplate from 'views/help.html';
import oktaDescriptionTemplate from 'views/oktaDescription.html';

angular
  .module('confRegistrationWebApp')
  .config(function(
    $locationProvider,
    $httpProvider,
    $qProvider,
    $routeProvider,
    envServiceProvider,
    $compileProvider,
    gettext,
  ) {
    $locationProvider.html5Mode(true).hashPrefix('');
    $httpProvider.useApplyAsync(true);
    $qProvider.errorOnUnhandledRejections(false);

    $httpProvider.interceptors.push('currentRegistrationInterceptor');
    $httpProvider.interceptors.push('httpUrlInterceptor');
    $httpProvider.interceptors.push('authorizationInterceptor');
    $httpProvider.interceptors.push('unauthorizedInterceptor');
    $httpProvider.interceptors.push('statusInterceptor');

    envServiceProvider.config({
      domains: {
        development: ['localhost'],
        staging: ['stage.eventregistrationtool.com', '*.netlify.com'],
        production: [
          'www.eventregistrationtool.com',
          'eventregistrationtool.com',
        ],
      },
      vars: {
        development: {
          apiUrl:
            'https://api.stage.eventregistrationtool.com/eventhub-api/rest/',
          tsysEnvironment: 'staging',
        },
        staging: {
          apiUrl:
            'https://api.stage.eventregistrationtool.com/eventhub-api/rest/',
          tsysEnvironment: 'production',
        },
        production: {
          apiUrl: 'https://api.eventregistrationtool.com/eventhub-api/rest/',
          tsysEnvironment: 'production',
        },
      },
    });

    // Determine which environment we are running in
    envServiceProvider.check();

    if (
      envServiceProvider.is('production') ||
      envServiceProvider.is('staging')
    ) {
      $compileProvider.debugInfoEnabled(false);
    }

    $routeProvider
      .when('/', {
        title: gettext('Search for event'),
        templateUrl: landingTemplate,
        controller: 'landingCtrl',
      })
      .when('/register/:conferenceId', {
        title: gettext('Register'),
        resolve: {
          redirect: function($location, $route) {
            $location.path(
              '/register/' + $route.current.params.conferenceId + '/page/',
            );
          },
        },
      })
      .when('/register/:conferenceId/page/:pageId?', {
        title: gettext('Register'),
        templateUrl: registrationTemplate,
        controller: 'RegistrationCtrl',
        authorization: {
          requireLogin: true,
          allowNoneAuth: true,
        },
        resolve: {
          conference: function($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          },
          currentRegistration: function(
            $route,
            $q,
            $location,
            $rootScope,
            RegistrationCache,
          ) {
            var q = $q.defer();
            RegistrationCache.getCurrent($route.current.params.conferenceId)
              .then(function(registration) {
                if (
                  registration.completed &&
                  angular.isUndefined($route.current.params.pageId)
                ) {
                  $location.path(
                    '/reviewRegistration/' + $route.current.params.conferenceId,
                  );
                } else {
                  q.resolve(registration);
                }
              })
              .catch(function(error) {
                $rootScope.currentRegistrationErrorMessage = error;
                q.resolve(null);
              });
            return q.promise;
          },
        },
      })
      .when('/approvePayment/:paymentHash', {
        title: gettext('Approve Payment'),
        templateUrl: paymentApprovalTemplate,
        controller: 'PaymentApprovalCtrl',
        authorization: {
          requireLogin: true,
        },
      })
      .when('/reviewRegistration/:conferenceId', {
        title: gettext('Review Registration'),
        templateUrl: reviewRegistrationTemplate,
        controller: 'ReviewRegistrationCtrl',
        authorization: {
          requireLogin: true,
          allowNoneAuth: true,
        },
        resolve: {
          currentRegistration: function($route, RegistrationCache) {
            RegistrationCache.emptyCache();
            return RegistrationCache.getCurrent(
              $route.current.params.conferenceId,
            ).then(function(currentRegistration) {
              return currentRegistration;
            });
          },
          conference: function($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          },
        },
      })
      .when('/preview/:conferenceId/page/:pageId?', {
        title: gettext('Preview Registration'),
        templateUrl: registrationTemplate,
        controller: 'RegistrationCtrl',
        authorization: {
          requireLogin: true,
        },
        resolve: {
          conference: function($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          },
          currentRegistration: function($route, RegistrationCache) {
            return RegistrationCache.getCurrent(
              $route.current.params.conferenceId,
            );
          },
        },
      })
      .when('/eventDashboard', {
        title: gettext('My Dashboard'),
        templateUrl: eventDashboardTemplate,
        controller: 'eventDashboardCtrl',
        authorization: {
          requireLogin: true,
        },
        resolve: {
          conferences: function($route, ConfCache) {
            return ConfCache.get('');
          },
        },
      })
      .when('/eventOverview/:conferenceId', {
        title: gettext('Overview'),
        templateUrl: eventOverviewTemplate,
        controller: 'eventOverviewCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'VIEW',
        },
        resolve: {
          conference: function($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          },
        },
      })
      .when('/eventRegistrations/:conferenceId', {
        title: gettext('Registrations'),
        templateUrl: eventRegistrationsTemplate,
        controller: 'eventRegistrationsCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'VIEW',
        },
        resolve: {
          conference: function($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          },
          permissions: function($route, PermissionCache) {
            return PermissionCache.getForConference(
              $route.current.params.conferenceId,
            );
          },
        },
      })
      .when('/paymentCashCheckReport/:conferenceId', {
        title: gettext('Payment Cash & Check Report Preview'),
        templateUrl: paymentCashCheckReportTemplate,
        controller: 'paymentCashCheckReportCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'VIEW',
        },
        resolve: {
          report: function($route, paymentReportService) {
            return paymentReportService.getReport(
              $route.current.params.conferenceId,
              {},
            );
          },
          reportList: function($route, paymentReportService) {
            return paymentReportService.getAll(
              $route.current.params.conferenceId,
            );
          },
          conference: function($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          },
          permissions: function($route, PermissionCache) {
            return PermissionCache.getForConference(
              $route.current.params.conferenceId,
            );
          },
        },
      })
      .when('/journalUpload/:conferenceId', {
        title: gettext('Journal Submission Upload Preview'),
        templateUrl: journalUploadTemplate,
        controller: 'journalUploadCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'VIEW',
        },
        resolve: {
          registrationsData: ($route, journalUploadService) =>
            journalUploadService.getRegistrationData(
              $route.current.params.conferenceId,
            ),
          reports: ($route, journalUploadService) =>
            journalUploadService.getAllAccountTransferReports(
              $route.current.params.conferenceId,
            ),
          conference: ($route, ConfCache) =>
            ConfCache.get($route.current.params.conferenceId, true),
          permissions: ($route, PermissionCache) =>
            PermissionCache.getForConference(
              $route.current.params.conferenceId,
            ),
        },
      })
      .when('/eventForm/:conferenceId', {
        title: gettext('Questions'),
        templateUrl: eventFormTemplate,
        controller: 'eventFormCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'UPDATE',
        },
        resolve: {
          conference: function($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          },
        },
      })
      .when('/eventDetails/:conferenceId', {
        title: gettext('Details'),
        templateUrl: eventDetailsTemplate,
        controller: 'eventDetailsCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'UPDATE',
        },
        resolve: {
          conference: function($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId, true);
          },
          currencies: function(ConfCache) {
            return ConfCache.initCurrencies()
              .then(function(data) {
                return data;
              })
              .catch(function() {
                return [];
              });
          },
        },
      })
      .when('/eventUsers/:conferenceId', {
        title: gettext('Users'),
        templateUrl: eventPermissionsTemplate,
        controller: 'eventPermissionsCtrl',
        authorization: {
          requireLogin: true,
          eventAdminPermissionLevel: 'FULL',
        },
        resolve: {
          conference: function($route, ConfCache) {
            return ConfCache.get($route.current.params.conferenceId);
          },
          conferencePermissions: function($route, ConfCache) {
            return ConfCache.getPermissions($route.current.params.conferenceId);
          },
        },
      })
      .when('/activatePermission/:permissionAuthCode', {
        title: gettext('Activate Permission'),
        template: '{{message}}',
        controller: 'activatePermissionCtrl',
        authorization: {
          requireLogin: true,
        },
      })
      .when('/auth/:token', {
        title: gettext('Signing In'),
        resolve: {
          redirectToIntendedRoute: [
            '$location',
            '$cookies',
            '$route',
            '$rootScope',
            'ProfileCache',
            function($location, $cookies, $route, $rootScope, ProfileCache) {
              $cookies.put('crsAuthProviderType', '');
              $cookies.put('crsToken', $route.current.params.token);
              $rootScope.crsToken = $cookies.get('crsToken');
              ProfileCache.getCache()
                .then(function(data) {
                  $cookies.put('crsAuthProviderType', data.authProviderType);
                })
                .catch(() => {
                  $cookies.remove('crsToken');
                  $cookies.remove('crsToken', {
                    domain: 'eventregistrationtool.com',
                  });
                  $cookies.remove('crsToken', {
                    domain: 'www.eventregistrationtool.com',
                  });
                })
                .finally(() => {
                  if (angular.isDefined($cookies.get('regType'))) {
                    $location
                      .path($cookies.get('intendedRoute') || '/')
                      .search('regType', $cookies.get('regType'))
                      .replace();
                    $cookies.remove('regType');
                  } else {
                    $location
                      .path($cookies.get('intendedRoute') || '/')
                      .replace();
                  }
                });
            },
          ],
        },
      })
      .when('/logout', {
        title: gettext('Signing Out'),
        resolveRedirectTo: /*@ngInject*/ function(
          $location,
          $cookies,
          $window,
          $http,
          ProfileCache,
          $rootScope,
          $sce,
          logoutService,
        ) {
          return $http
            .get('auth/logout')
            .catch(angular.noop)
            .then(response => {
              $cookies.remove('crsToken');
              ProfileCache.clearCache();
              logoutService.logoutFormProviders(response);
              $cookies.remove('crsAuthProviderType');
              return '/';
            });
        },
      })
      .when('/help', {
        title: gettext('Help'),
        templateUrl: helpTemplate,
        controller: 'helpCtrl',
      })
      .when('/oktaDescription', {
        title: gettext('Okta Description'),
        templateUrl: oktaDescriptionTemplate,
        controller: 'oktaDescriptionCtrl',
      })
      .otherwise({
        redirectTo: '/',
      });
  });
