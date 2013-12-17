'use strict';

angular.module('confRegistrationWebApp')
  .directive('adminNav', function () {
    return {
      templateUrl: 'views/adminNav.html',
      restrict: 'A',
      controller: function ($scope, $modal) {
        $scope.deleteConference = function (conferenceToDelete) {

          $modal.open({
            templateUrl: 'views/confirmDeleteConf.html',
            controller: 'confirmCtrl'
          }).result.then(function (result) {
              if (result) {
                alert('delete ' + conferenceToDelete);
              }
            });
        };
      }
    };
  });
