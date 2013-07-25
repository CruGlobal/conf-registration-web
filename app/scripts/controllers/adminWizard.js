'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminWizardCtrl', function ($scope, conference) {
          $scope.conference=conference;
  });
