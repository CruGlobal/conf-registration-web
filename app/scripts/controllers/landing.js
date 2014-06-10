'use strict';

angular.module('confRegistrationWebApp')
  .controller('landingCtrl', function ($rootScope) {
    $rootScope.globalPage = {
      type: 'landing',
      class: 'dashboard',
      title: '',
      confId: 0,
      footer: true
    };
  });
