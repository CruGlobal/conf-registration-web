'use strict';

angular.module('confRegistrationWebApp')
  .controller('MainCtrl', function ($scope, ConfCache) {
    $scope.$on('conferences/', function (event, conferences) {
      $scope.conferences = conferences;
    });
    ConfCache.query();
  });
