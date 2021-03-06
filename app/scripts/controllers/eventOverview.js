/* eslint-disable angular/no-private-call */

angular
  .module('confRegistrationWebApp')
  .controller('eventOverviewCtrl', function(
    $rootScope,
    $scope,
    $location,
    $route,
    ConfCache,
    conference,
  ) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container event-overview',
      bodyClass: '',
      confId: conference.id,
      footer: true,
    };

    $scope.conference = conference;

    var port = '';
    if ($location.$$port !== 80 && $location.$$port !== 443) {
      port = ':' + $location.$$port;
    }
    var baseUrl =
      $location.$$protocol +
      '://' +
      $location.$$host +
      port +
      '/register/' +
      conference.id;
    $scope.registrationUrl = {};
    $scope.registrationUrl[0] = baseUrl;

    angular.forEach(conference.registrantTypes, function(t) {
      $scope.registrationUrl[t.id] = baseUrl + '?regType=' + t.id;
    });
  });
