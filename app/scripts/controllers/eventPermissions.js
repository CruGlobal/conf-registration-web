'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventPermissionsCtrl', function ($rootScope, $scope, $http, $sce, conference, currentPermissions, permissions, permissionConstants, modalMessage) {
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
    $scope.currentPermissions = currentPermissions;

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
          message: $sce.trustAsHtml('Error: ' + data.errorMessage)
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
      }).success(function (data) {
        $scope.currentPermissions.push(data);
        $scope.$$childHead.addPermissionsEmail = '';
        $scope.$$childHead.addPermissionsLevel = '';
        $scope.notify = {
          class: 'alert-success',
          message: $sce.trustAsHtml('User added.')
        };
      }).error(function (data) {
        $scope.notify = {
          class: 'alert-danger',
          message: $sce.trustAsHtml('Error: ' + data.errorMessage)
        };
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
        }).success(function () {
          _.remove($scope.currentPermissions, {id: id});
          $scope.notify = {
            class: 'alert-success',
            message: $sce.trustAsHtml('User removed.')
          };
        }).error(function (data) {
          $scope.notify = {
            class: 'alert-danger',
            message: $sce.trustAsHtml('Error: ' + data.errorMessage)
          };
        });
      });
    };
  });
