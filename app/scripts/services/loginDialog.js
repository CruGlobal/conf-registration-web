import template from 'views/modals/loginDialog.html';

angular.module('confRegistrationWebApp').service('loginDialog', function ($injector) {
  this.show = function (options) {
    var loginDialogOptions = {
      templateUrl: template,
      controller: /*@ngInject*/ function ($scope, $uibModalInstance, $location, envService) {
        $scope.apiUrl = envService.read('apiUrl');
        $scope.status401 = options.status401;
        $scope.allowFacebookLogin = options.allowFacebookLogin === undefined ? true : options.allowFacebookLogin;

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
