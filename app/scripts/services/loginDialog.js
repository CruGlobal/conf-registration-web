'use strict';

angular.module('confRegistrationWebApp').service('loginDialog', function ($injector) {
  this.show = function (status401) {
    var loginDialogOptions = {
      templateUrl: 'views/modals/loginDialog.html',
      controller: function ($scope, $modalInstance, $location, envService) {
        $scope.apiUrl = envService.read('apiUrl');
        $scope.status401 = status401;

        $scope.gotoRoute = function (path) {
          $modalInstance.dismiss();
          $location.path(path);
        };
      },
      backdrop: 'static',
      keyboard: false
    };

    var $modal = $injector.get('$modal');
    $modal.open(loginDialogOptions);
  };
});
