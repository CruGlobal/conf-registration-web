'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventPermissionsCtrl', function ($rootScope, $scope, conference, $http) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'registrations',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };

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
      }).error(function () {

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
