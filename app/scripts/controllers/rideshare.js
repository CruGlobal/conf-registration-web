'use strict';

angular.module('confRegistrationWebApp')
  .controller('RideshareCtrl', function ($rootScope, $scope, $http, conference, ConfCache, permissions, permissionConstants, uuid) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container conference-details',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };
    if (permissions.permissionInt >= permissionConstants.UPDATE) {
      $scope.templateUrl = 'views/rideshare.html';
    } else {
      $scope.templateUrl = 'views/permissionError.html';
    }

    $scope.conference = conference;

  });
