'use strict';

angular.module('confRegistrationWebApp')
  .controller('CreateConferenceDialogCtrl', function ($scope, ConfCache, dialog, $location) {
    $scope.submit = function () {
      ConfCache.create($scope.name).then(function (conference) {
        dialog.close();
        $location.path('/wizard/' + conference.id);
      });
    };
  });
