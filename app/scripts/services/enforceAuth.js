'use strict';

angular.module('confRegistrationWebApp')
  .factory('enforceAuth', function ($route, $modal, $cookies, $q, $window, apiUrl, $http) {
    var defer = $q.defer();

    if (angular.isDefined($cookies.crsToken) && $cookies.crsToken !== '') {
      defer.resolve('Authorization present.');
    } else {
      var loginDialogOptions = {
        templateUrl: 'views/loginDialog.html',
        controller: 'LoginDialogCtrl',
        backdrop: 'static',
        keyboard: false
      };

      if($route.current.$$route.controller === 'RegistrationCtrl'){
        //$modal.open(loginDialogOptions);
        $http.get('conferences/'+$route.current.params.conferenceId).success(function (conference) {
          console.log(conference);
          $window.location.href = apiUrl + 'auth/none/login';
        });
      }else{
        $modal.open(loginDialogOptions);
      }
    }

    return defer.promise;
  });
