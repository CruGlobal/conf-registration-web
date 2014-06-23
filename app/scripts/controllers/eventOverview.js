'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventOverviewCtrl', function ($rootScope, $scope, $location, $route, ConfCache, conference) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'conference-details',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };

    $scope.conference = conference;
    var port = '';
    if ($location.$$port !== 80 && $location.$$port !== 443) {
      port = ':' + $location.$$port;
    }
    $scope.registrationUrl = $location.$$protocol + '://' + $location.$$host + port + '/#/register/' + conference.id;

    $scope.refreshEventData = function () {
      $scope.conference.completedRegistrationCount = '-';
      ConfCache.empty();
      $route.reload();
    };
  });
