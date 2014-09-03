'use strict';

angular.module('confRegistrationWebApp')
  .controller('LoginDialogCtrl', function ($rootScope, $scope, $location, $cookies, $routeParams, apiUrl) {
    $rootScope.globalPage = {
      type: '',
      class: '',
      title: '',
      confId: 0,
      footer: false
    };

    $scope.apiUrl = apiUrl;

    if (!/^\/auth\/.*/.test($location.url())) {
      $cookies.intendedRoute = $location.path();
      if(angular.isDefined($routeParams.regType)){
        $cookies.regType = $routeParams.regType;
      }
    }
  });