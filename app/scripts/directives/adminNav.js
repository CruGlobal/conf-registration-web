'use strict';

angular.module('confRegistrationWebApp')
  .directive('adminNav', function ($http, ConfCache, modalMessage) {
    return {
      templateUrl: 'views/components/adminNav.html',
      restrict: 'A',
      controller: function ($scope, $location, PermissionCache, permissionConstants) {
        $scope.isActive = function(viewLocation){
          return viewLocation === $location.path().substr(0, viewLocation.length);
        };
        $scope.archiveEvent = function (conferenceId) {
          PermissionCache.getForConference(conferenceId).then(function(permissions){
            if(permissions.permissionInt < permissionConstants.FULL){
              modalMessage.error('You do not have permission to perform this action. Please contact an event admin to request permission.');
              return;
            }

            modalMessage.confirm({
              'title': 'Archive Event',
              'question': 'Are you sure you want to archive this event? Events can be unarchived later.',
              'yesString': 'Archive',
              'noString': 'Cancel',
              'normalSize': true
            }).then(function(){
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
                  modalMessage.error('Error: ' + data);
                });
              });
            });
          });
        };
      }
    };
  });
