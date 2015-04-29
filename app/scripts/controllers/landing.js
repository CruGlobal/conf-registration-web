'use strict';

angular.module('confRegistrationWebApp')
  .controller('landingCtrl', function ($rootScope, $scope, $http, $cookies, $window, $location, apiUrl) {
    $rootScope.globalPage = {
      type: 'landing',
      mainClass: 'dashboard',
      bodyClass: '',
      title: '',
      confId: 0,
      footer: true
    };

    $scope.userIsLoggedIn = function(){
      return angular.isDefined($cookies.crsToken) && $cookies.crsAuthProviderType !== 'NONE';
    };

    $scope.login = function(provider){
      $cookies.intendedRoute = '/eventDashboard';
      if(provider === 'RELAY'){
        $window.location.href = apiUrl + 'auth/relay/login?logoutCallbackUrl=' + apiUrl + 'auth/relay/logout';
      }else if(provider === 'FACEBOOK'){
        $window.location = apiUrl + 'auth/facebook/authorization';
      }
    };

    $scope.eventSearch = function(val) {
      return $http.get('conferences', {
        params: {
          conferenceName: val
        }
      }).then(function(response){
        return response.data;
      });
    };

    $scope.selectEvent = function(item){
      $location.path('/register/' + item.id + '/page/');
    };
  });
