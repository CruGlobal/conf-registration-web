'use strict';

angular.module('confRegistrationWebApp')
  .directive('adminNav', function ($http, ConfCache) {
    return {
      templateUrl: 'views/components/adminNav.html',
      restrict: 'A',
      controller: function ($scope, $modal, $location, PermissionCache, permissionConstants) {
        $scope.isActive = function(viewLocation){
          return viewLocation === $location.path().substr(0, viewLocation.length);
        };
        $scope.archiveEvent = function (conferenceId) {
          PermissionCache.getForConference(conferenceId).then(function(permissions){
            if(permissions.permissionInt < permissionConstants.FULL){
              $modal.open({
                templateUrl: 'views/modals/errorModal.html',
                controller: 'genericModal',
                resolve: {
                  data: function () {
                    return 'You do not have permission to perform this action. Please contact an event admin to request permission.';
                  }
                }
              });
              return;
            }

            $modal.open({
              templateUrl: 'views/modals/archiveEvent.html',
              controller: 'confirmCtrl'
            }).result.then(function (result) {
                if (result) {
                  ConfCache.getCallback(conferenceId, function(conference){
                    conference.archived = true;

                    $http({
                      method: 'PUT',
                      url: 'conferences/' + conferenceId,
                      data: conference
                    }).success(function () {
                      //Clear cache
                      ConfCache.empty();

                      //redirect to dashboard
                      $location.path('/eventDashboard');
                    }).error(function (data) {
                      alert('Error: ' + data);
                    });
                  });
                }
              });
          });
        };
      }
    };
  });
