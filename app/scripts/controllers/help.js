angular
  .module('confRegistrationWebApp')
  .controller('helpCtrl', function($rootScope) {
    $rootScope.globalPage = {
      type: 'landing',
      mainClass: 'container',
      bodyClass: '',
      confId: 0,
      footer: true,
    };
  });
