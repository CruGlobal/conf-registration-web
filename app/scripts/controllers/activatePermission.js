'use strict';

angular.module('confRegistrationWebApp')
  .controller('activatePermissionCtrl', function ($scope, $route, $http, $location, $timeout) {
    var permissionAuthCode = $route.current.params.permissionAuthCode;

    $scope.message = 'Verifying Auth Code...';

    $http({method: 'PUT',
      url: 'permissions/' + permissionAuthCode + '/accept'
    }).success(function () {
        $scope.message = 'Success! Permission has been granted.  Redirecting now...';
        $timeout(function () { $location.path('/eventDashboard'); }, 2000);
      }).error(function (data, status) {
        if (status === 404) {
          $scope.message = 'Error: Permission auth code was not found.';
        } else if (status === 403) {
          $scope.message = 'Error: Permission auth code has already been used or is more than 2 months old.';
        } else {
          $scope.message = 'An error has occurred while attempting to accept this auth code. ' + data;
        }
      });
  });
