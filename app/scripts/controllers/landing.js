'use strict';

angular.module('confRegistrationWebApp')
  .controller('landingCtrl', function ($rootScope) {
    $rootScope.globalPage = {
      type: 'landing',
      mainClass: 'container dashboard',
      bodyClass: '',
      title: '',
      confId: 0,
      footer: true
    };
  });
