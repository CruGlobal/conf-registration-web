angular
  .module('confRegistrationWebApp')
  .controller('oktaDescriptionCtrl', function($rootScope) {
    $rootScope.globalPage = {
      type: 'landing',
      mainClass: 'container',
      bodyClass: '',
      confId: 0,
      footer: true,
    };
  });
