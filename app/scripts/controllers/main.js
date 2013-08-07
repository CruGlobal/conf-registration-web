'use strict';

angular.module('confRegistrationWebApp')
  .controller('MainCtrl', function ($scope, ConfCache, $dialog) {
    $scope.$on('conferences/', function (event, conferences) {
      $scope.conferences = conferences;
    });
    ConfCache.query();

    var createConferenceDialogOptions = {
      templateUrl: 'views/createConference.html',
      controller: 'CreateConferenceDialogCtrl'
    };

    $scope.createConference = function () {
      $dialog.dialog(createConferenceDialogOptions).open();
    };
  });
