'use strict';

angular.module('confRegistrationWebApp')
  .directive('totalDue', function ($modal) {
    return {
      templateUrl: 'views/totalDue.html',
      restrict: 'E',
      scope: {
        registration: '=',
        permissions: '='
      },
      controller: function ($scope, $route, $http) {
        $scope.canEdit = $scope.permissions.permissionLevel === 'CREATOR' || $scope.permissions.permissionLevel === 'UPDATE';


        var editTotalDueDialogOptions = {
          templateUrl: 'views/editTotalDue.html',
          controller: 'EditTotalDueDialogCtrl',
          scope: $scope
        }

          $scope.createEditDialog = function () {
          if ($scope.canEdit) {
            $modal.open(editTotalDueDialogOptions).result.then(function () {

            });
          }
        };;
      }
    };
  });