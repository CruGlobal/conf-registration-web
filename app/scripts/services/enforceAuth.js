'use strict';

angular.module('confRegistrationWebApp')
  .constant('enforceAuth', function ($route, $modal, $cookies, $q, $window, apiUrl, $http) {
    var defer = $q.defer();

    var noAuthControllers = ['RegistrationCtrl','paymentCtrl','ReviewRegistrationCtrl'];

    var loginDialogOptions = {
      templateUrl: 'views/loginDialog.html',
      controller: 'LoginDialogCtrl',
      backdrop: 'static',
      keyboard: false
    };

    if(noAuthControllers.indexOf($route.current.$$route.controller) >= 0){
      if(angular.isDefined($cookies.crsToken) && $cookies.crsToken !== ''){
        defer.resolve('Authorization present.');
      }else{
        $http.get('conferences/'+$route.current.params.conferenceId).success(function (conference) {
          if(conference.requireLogin){
            $modal.open(loginDialogOptions);
          }else{
            $window.location.href = apiUrl + 'auth/none/login';
          }
        });
      }
    }else{
      if(angular.isDefined($cookies.crsToken) && $cookies.crsToken !== '' && $cookies.crsAuthProviderType === 'RELAY'){
        defer.resolve('Authorization present.');
      }else{
        $modal.open(loginDialogOptions);
      }
    }

    return defer.promise;
  });