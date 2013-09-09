'use strict';

angular.module('confRegistrationWebApp')
  .controller('GrowlAlertCtrl', function ($scope, GrowlService) {
    $scope.undo = function () {
      GrowlService.undo();
    };
  });
