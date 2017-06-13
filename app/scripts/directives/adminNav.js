import template from 'views/components/adminNav.html';

angular.module('confRegistrationWebApp')
  .directive('adminNav', function ($http, ConfCache, modalMessage) {
    return {
      templateUrl: template,
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
              ConfCache.get(conferenceId).then(function(conference){
                conference.archived = true;

                $http({
                  method: 'PUT',
                  url: 'conferences/' + conferenceId,
                  data: conference
                }).then(function () {
                  //Clear cache
                  ConfCache.empty();

                  //redirect to dashboard
                  $location.path('/eventDashboard');
                }).catch(function (response) {
                  modalMessage.error(response.data && response.data.error ? response.data.error.message : 'An error has occurred.');
                });
              });
            });
          });
        };
      }
    };
  });
