'use strict';

angular.module('confRegistrationWebApp')
  .directive('adminNav', function ($http, ConfCache) {
    return {
      templateUrl: 'views/components/adminNav.html',
      restrict: 'A',
      controller: function ($scope, $modal) {
        $scope.deleteEvent = function (conferenceId) {
          $modal.open({
            templateUrl: 'views/modals/confirmDeleteConf.html',
            controller: 'confirmCtrl'
          }).result.then(function (result) {
              if (result) {
                $http({
                    method: 'DELETE',
                    url: 'conferences/' + conferenceId
                  }).success(function () {

                    //Clear cache
                    ConfCache.empty();
                  }).error(function (data) {
                    alert('Error: ' + data);
                  });
              }
            });
        };
      }
    };
  });
