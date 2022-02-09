/* eslint-disable angular/no-private-call */

angular
  .module('confRegistrationWebApp')
  .controller(
    'eventOverviewCtrl',
    function (
      $rootScope,
      $scope,
      $location,
      $filter,
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
      $scope.displayAddress = $filter('eventAddressFormat')(
        $scope.conference.locationCity,
        $scope.conference.locationState,
        $scope.conference.locationZipCode,
        $scope.conference.locationCountry,
      );

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

      angular.forEach(conference.registrantTypes, function (t) {
        $scope.registrationUrl[t.id] = baseUrl + '?regType=' + t.id;
      });
    },
  );
