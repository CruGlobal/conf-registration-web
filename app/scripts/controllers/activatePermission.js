'use strict';

angular.module('confRegistrationWebApp')
  .controller('activatePermissionCtrl', function ($scope, $route, $http, $location, $timeout, gettextCatalog) {
    var permissionAuthCode = $route.current.params.permissionAuthCode;

    $scope.message = gettextCatalog.getString('Verifying Auth Code...');

    $http({method: 'PUT',
      url: 'permissions/' + permissionAuthCode + '/accept'
    }).then(function () {
        $scope.message = gettextCatalog.getString('Success! Permission has been granted. Redirecting now...');
        $timeout(function () { $location.path('/eventDashboard'); }, 2000);
      }).catch(function (response) {
        if (response.status === 404) {
          $scope.message = gettextCatalog.getString('Error: Permission auth code was not found.');
        } else if (response.status === 403) {
          $scope.message = gettextCatalog.getString('Error: Permission auth code has already been used or is more than 2 months old.');
        } else {
          $scope.message = 'An error has occurred while attempting to accept this auth code. ' + response.data;
        }
      });
  });
