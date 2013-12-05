'use strict';

angular.module('confRegistrationWebApp')
  .directive('adminNav', function () {
    return {
      templateUrl: 'views/adminNav.html',
      restrict: 'A',
      controller: function ($scope, $modal) {
        $scope.deleteConference = function (conferenceToDelete) {
        console.log(conferenceToDelete);

        $modal.open({
          templateUrl: 'views/confirmDeleteConf.html',
          controller: 'confirmCtrl',
          resolve: {
            defaultValue: function () {
              return ' (clone)';
            }
          }
        }).result.then(function (result) {
          if(result){
            alert('delete');
          }
        });
      };
      }
    };
  });
