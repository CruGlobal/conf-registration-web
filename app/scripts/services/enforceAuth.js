'use strict';

angular.module('confRegistrationWebApp')
  .factory('enforceAuth', function ($route, $modal, $cookies, $q) {
    var defer = $q.defer();

    if (angular.isDefined($cookies.crsToken)) {
      defer.resolve('Authorization present.');
    } else {
      var loginDialogOptions = {
        templateUrl: 'views/loginDialog.html',
        controller: 'LoginDialogCtrl',
        backdropClick: false,
        keyboard: false
      };
      $modal.open(loginDialogOptions);
    }

    return defer.promise;
  });
