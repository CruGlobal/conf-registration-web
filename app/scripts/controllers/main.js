'use strict';

angular.module('confRegistrationWebApp')
  .controller('MainCtrl', function ($scope, ConfCache, $modal, $location, $http) {
    $scope.$on('conferences/', function (event, conferences) {
      $scope.conferences = conferences;
      for (var i = 0; i < $scope.conferences.length; i++) {
        getTotalRegistrations(conferences[i].id, i);
      }
    });

    function getTotalRegistrations(confId, confIndex) {
      $http.get('conferences/' + confId + '/registrations').success(function (result) {
        $scope.conferences[confIndex]['totalRegistrations'] = _.filter(result, function (item) {
          return item.completed === true;
        }).length;
      });
    }
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
