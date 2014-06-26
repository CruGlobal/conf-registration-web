'use strict';

angular.module('confRegistrationWebApp')
  .directive('adminNav', function ($http, ConfCache) {
    return {
      templateUrl: 'views/components/adminNav.html',
      restrict: 'A',
      controller: function ($scope, $modal, $location) {
        $scope.archiveEvent = function (conferenceId) {
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
        };
      }
    };
  });
