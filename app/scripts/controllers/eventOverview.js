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
    $scope.conferenceTimes = {
      eventStartTime : moment.parseZone($scope.conference.eventStartTime).format('dddd, MMM DD, YYYY hh:mm A'),
      eventEndTime : moment.parseZone($scope.conference.eventEndTime).format('dddd, MMM DD, YYYY hh:mm A'),
      registrationStartTime : moment.parseZone($scope.conference.registrationStartTime).format('dddd, MMM DD, YYYY hh:mm A'),
      registrationEndTime : moment.parseZone($scope.conference.registrationEndTime).format('dddd, MMM DD, YYYY hh:mm A')
    };

    var port = '';
    if ($location.$$port !== 80 && $location.$$port !== 443) {
      port = ':' + $location.$$port;
    }
    $scope.registrationUrl = $location.$$protocol + '://' + $location.$$host + port + '/#/register/' + conference.id;
  });
