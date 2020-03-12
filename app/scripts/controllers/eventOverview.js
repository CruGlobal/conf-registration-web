/* eslint-disable angular/no-private-call */

angular
  .module('confRegistrationWebApp')
  .controller(
    'eventOverviewCtrl',
    (
      $rootScope,
      $scope,
      $location,
      $route,
      $http,
      $sce,
      ConfCache,
      conference,
  ) => {
      $rootScope.globalPage = {
        type: 'admin',
        mainClass: 'container event-overview',
        bodyClass: '',
        confId: conference.id,
        footer: true,
      };
    },
  );
