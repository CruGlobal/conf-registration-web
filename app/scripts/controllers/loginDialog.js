'use strict';

angular.module('confRegistrationWebApp')
  .controller('LoginDialogCtrl', function ($rootScope, $scope, apiUrl) {
    $rootScope.globalPage = {
      type: '',
      class: '',
      title: '',
      confId: 0,
      footer: false
    };

    $scope.apiUrl = apiUrl;
  });