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

    if(angular.isDefined($cookies.crsToken) && $cookies.crsToken !== '' && noAuthControllers.indexOf($route.current.$$route.controller) >= 0){
      defer.resolve('Authorization present.');
    }else if(angular.isDefined($cookies.crsToken) && $cookies.crsToken !== '' && $cookies.crsAuthProviderType === 'RELAY'){
      defer.resolve('Authorization present.');
    }else if($route.current.$$route.controller === 'RegistrationCtrl'){
      $http.get('conferences/'+$route.current.params.conferenceId).success(function (conference) {
        console.log(conference);
        $window.location.href = apiUrl + 'auth/none/login';
      });
    }else{
      $modal.open(loginDialogOptions);
    }

    return defer.promise;
  });