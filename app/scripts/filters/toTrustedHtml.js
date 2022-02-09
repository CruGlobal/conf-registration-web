angular
  .module('confRegistrationWebApp')
  .filter('toTrustedHtml', function ($sce) {
    return function (text) {
      return $sce.trustAsHtml(text);
    };
  });
