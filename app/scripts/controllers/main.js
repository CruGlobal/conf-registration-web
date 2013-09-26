'use strict';

angular.module('confRegistrationWebApp')
  .controller('MainCtrl', function ($scope, ConfCache, $modal, $location) {
    $scope.$on('conferences/', function (event, conferences) {
      $scope.conferences = conferences;
    });
    ConfCache.query();

    var createConferenceDialogOptions = {
      templateUrl: 'views/createConference.html',
      controller: 'CreateConferenceDialogCtrl'
    };

    $scope.createConference = function () {
      $modal.open(createConferenceDialogOptions).result.then(function (conferenceName) {
        if (conferenceName !== null && conferenceName !== '' && !angular.isUndefined(conferenceName)) {
          ConfCache.create(conferenceName).then(function (conference) {
            $location.path('/wizard/' + conference.id);
          });
        }
      });
    };
  });
