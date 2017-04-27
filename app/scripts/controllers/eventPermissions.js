'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventPermissionsCtrl', function ($rootScope, $scope, $http, $route, conference, conferencePermissions, modalMessage) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container event-users',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };
    $scope.conference = conference;
    $scope.currentPermissions = conferencePermissions;

    $scope.updatePermission = function (id) {
      $http({method: 'PUT',
        url: 'permissions/' + id,
        data: _.find($scope.currentPermissions, { 'id': id })
      }).then(function () {
        $scope.notify = {
          class: 'alert-success',
          message: 'User updated.'
        };

        //update timestamp
        _.find($scope.currentPermissions, { 'id': id }).timestamp = new Date();
      }).catch(function (data) {
        modalMessage.error(data.error ? data.error.message : 'User could not be updated.');
        $route.reload();
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
      }).then(function (data) {
        $scope.currentPermissions.push(data);
        $scope.addPermissionsEmail = '';
        $scope.addPermissionsLevel = '';
        $scope.notify = {
          class: 'alert-success',
          message: 'Email invite sent.'
        };
      }).catch(function (data) {
        modalMessage.error(data.error ? data.error.message : 'User could not be added.');
      });
    };

    $scope.deletePermission = function (id) {
      modalMessage.confirm({
        'title': 'Remove User?',
        'question': 'Are you sure you want to remove this user?'
      }).then(function(){
        $http({
          method: 'DELETE',
          url: 'permissions/' + id
        }).then(function () {
          _.remove($scope.currentPermissions, {id: id});
          $scope.notify = {
            class: 'alert-success',
            message: 'User removed.'
          };
        }).catch(function (data) {
          modalMessage.error(data.error ? data.error.message : 'User could not be removed.');
        });
      });
    };

    $scope.resendEmail = function(permission){
      $http({
        method: 'DELETE',
        url: 'permissions/' + permission.id
      }).then(function () {
        _.remove($scope.currentPermissions, {id: permission.id});
        $scope.addPermission(permission.emailAddress, permission.permissionLevel);
      });
    };
  });
