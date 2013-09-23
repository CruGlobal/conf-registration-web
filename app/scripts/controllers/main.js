'use strict';

angular.module('confRegistrationWebApp')
  .controller('MainCtrl', function ($scope, ConfCache, $modal) {
    $scope.$on('conferences/', function (event, conferences) {
      $scope.conferences = conferences;
    });
    ConfCache.query();

    var createConferenceDialogOptions = {
      templateUrl: 'views/createConference.html',
      controller: 'CreateConferenceDialogCtrl'
    };

    $scope.createConference = function () {
      $modal.open(createConferenceDialogOptions);
    };
  });
