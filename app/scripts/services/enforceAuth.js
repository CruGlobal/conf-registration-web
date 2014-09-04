'use strict';

angular.module('confRegistrationWebApp')
  .constant('enforceAuth', function ($rootScope, $route, $modal, $cookies, $q, $location, $window, $routeParams, apiUrl, $http, ProfileCache) {
    var defer = $q.defer();

    var noAuthControllers = ['RegistrationCtrl', 'paymentCtrl', 'ReviewRegistrationCtrl'];

    var loginDialogOptions = {
      templateUrl: 'views/modals/loginDialog.html',
      controller: 'LoginDialogCtrl',
      backdrop: 'static',
      keyboard: false
    };

    if (!/^\/auth\/.*/.test($location.url())) {
      $cookies.intendedRoute = $location.path();
      if(angular.isDefined($routeParams.regType)){
        $cookies.regType = $routeParams.regType;
      }
    }

    if (noAuthControllers.indexOf($route.current.$$route.controller) >= 0) {
      if (angular.isDefined($cookies.crsToken) && $cookies.crsToken !== '') {
        defer.resolve('Authorization present.');
      } else {
        $http.get('conferences/' + $route.current.params.conferenceId).success(function (conference) {
          if (conference.requireLogin) {
            $modal.open(loginDialogOptions);
          } else {
            $window.location.href = apiUrl + 'auth/none/login';
          }
        });
      }
    } else {
      if (angular.isDefined($cookies.crsToken) && $cookies.crsToken !== '' && $cookies.crsAuthProviderType !== 'NONE') {
        defer.resolve('Authorization present.');

        if (angular.isUndefined($rootScope.globalGreetingName)) {
          ProfileCache.getCache(function (data) {
            $rootScope.globalGreetingName = data.firstName;
          });
        }
      } else {
        $modal.open(loginDialogOptions);
      }
    }

    return defer.promise;
  });