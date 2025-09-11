import template from 'views/modals/loginDialog.html';

angular
  .module('confRegistrationWebApp')
  .service('loginDialog', function ($injector, $rootScope) {
    this.show = function (options) {
      if ($rootScope.loginModalOpen) {
        return;
      }

      var loginDialogOptions = {
        templateUrl: template,
        controller: /*@ngInject*/ function (
          $scope,
          $uibModalInstance,
          $location,
          envService,
        ) {
          $scope.apiUrl = envService.read('apiUrl');
          $scope.clientUrl = window.location.origin;
          $scope.authError = options.authError;
          $scope.status401 = options.status401;
          $scope.relayLogin =
            options.relayLogin === undefined ? true : options.relayLogin;
          $scope.facebookLogin =
            options.facebookLogin === undefined ? true : options.facebookLogin;
          $scope.googleLogin =
            options.googleLogin === undefined ? true : options.googleLogin;
          $scope.gotoRoute = function (path) {
            $uibModalInstance.dismiss();
            $location.path(path);
          };
        },
        backdrop: 'static',
        keyboard: false,
        // aria-labelled-by is not announced for dialogs in Chrome on macOS https://issues.chromium.org/issues/41487406
        ariaLabelledBy: 'login-header',
      };

      var $uibModal = $injector.get('$uibModal');
      $rootScope.loginModalOpen = true;
      $uibModal.open(loginDialogOptions).result.finally(() => {
        $rootScope.loginModalOpen = false;
      });
    };
  });
