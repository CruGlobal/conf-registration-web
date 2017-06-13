import template from 'views/modals/loginDialog.html';

angular.module('confRegistrationWebApp').service('loginDialog', function ($injector) {
  this.show = function (status401) {
    var loginDialogOptions = {
      templateUrl: template,
      controller: /*@ngInject*/ function ($scope, $uibModalInstance, $location, envService) {
        $scope.apiUrl = envService.read('apiUrl');
        $scope.status401 = status401;

        $scope.gotoRoute = function (path) {
          $uibModalInstance.dismiss();
          $location.path(path);
        };
      },
      backdrop: 'static',
      keyboard: false
    };

    var $uibModal = $injector.get('$uibModal');
    $uibModal.open(loginDialogOptions);
  };
});
