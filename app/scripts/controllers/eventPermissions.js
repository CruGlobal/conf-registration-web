'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventPermissionsCtrl', function ($rootScope, $scope, conference, $http, permissions, permissionConstants) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'registrations',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };
    if (permissions.permissionInt >= permissionConstants.FULL) {
      $scope.templateUrl = 'views/eventPermissions.html';
    } else {
      $scope.templateUrl = 'views/permissionError.html';
    }
    $scope.conference = conference;

    var getPermissions = function () {
      $http({
          method: 'GET',
          url: 'conferences/' + conference.id + '/permissions'
        }).success(function (data) {
          $scope.currentPermissions = data;
        }).error(function () {

        });
    };
    getPermissions();

    $scope.updatePermission = function (id) {
      $http({method: 'PUT',
        url: 'permissions/' + id,
        data: _.find($scope.currentPermissions, { 'id': id })
      }).success(function () {
      }).error(function () {

      });
    };

    $scope.addPermission = function () {
      var postData = {
        conferenceId: conference.id,
        emailAddress: $scope.addPermissionsEmail,
        permissionLevel: $scope.addPermissionsLevel
      };
      $http({
        method: 'POST',
        url: 'conferences/' + conference.id + '/permissions',
        data: postData
      }).success(function () {
        getPermissions();
        $scope.addPermissionsEmail = '';
        $scope.addPermissionsLevel = '';
      }).error(function (data) {
        alert('Error: ' + data);
      });
    };

    $scope.deletePermission = function (id) {
      $http({
        method: 'DELETE',
        url: 'permissions/' + id
      }).success(function () {
        getPermissions();
      }).error(function () {
      });
    };
  });
