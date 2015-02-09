'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventPermissionsCtrl', function ($rootScope, $scope, $http, $sce, conference, permissions, permissionConstants) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container event-users',
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
        $scope.notify = {
          class: 'alert-success',
          message: $sce.trustAsHtml('User updated.')
        };

        //update timestamp
        _.find($scope.currentPermissions, { 'id': id }).timestamp = new Date();
      }).error(function (data) {
        $scope.notify = {
          class: 'alert-danger',
          message: $sce.trustAsHtml('Error: ' + data)
        };
      });
    };

    $scope.addPermission = function (addPermissionsEmail, addPermissionsLevel) {
      var postData = {
        conferenceId: conference.id,
        emailAddress: addPermissionsEmail,
        permissionLevel: addPermissionsLevel
      };
      $http({
        method: 'POST',
        url: 'conferences/' + conference.id + '/permissions',
        data: postData
      }).success(function () {
        getPermissions();
        $scope.$$childHead.addPermissionsEmail = '';
        $scope.$$childHead.addPermissionsLevel = '';
        $scope.notify = {
          class: 'alert-success',
          message: $sce.trustAsHtml('User added.')
        };
      }).error(function (data) {
        $scope.notify = {
          class: 'alert-danger',
          message: $sce.trustAsHtml('Error: ' + data)
        };
      });
    };

    $scope.deletePermission = function (id) {
      if(!confirm('Are you sure you want to remove this user?')){
        return;
      }
      $http({
        method: 'DELETE',
        url: 'permissions/' + id
      }).success(function () {
        getPermissions();
        $scope.notify = {
          class: 'alert-success',
          message: $sce.trustAsHtml('User removed.')
        };
      }).error(function (data) {
        $scope.notify = {
          class: 'alert-danger',
          message: $sce.trustAsHtml('Error: ' + data)
        };
      });
    };
  });
