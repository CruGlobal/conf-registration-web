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

        $scope.registerUser = function (conferenceId) {

          var registrationModalOptions = {
            templateUrl: 'views/registrationModal.html',
            controller: 'registrationModal',
            backdrop: 'static',
            keyboard: false,
            resolve: {
              conference: ['ConfCache', function (ConfCache) {
                return ConfCache.get(conferenceId);
              }]
            }
          };

          $modal.open(registrationModalOptions);
        };
      }
    };
  });
