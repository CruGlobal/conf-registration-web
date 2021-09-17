import template from 'views/modals/loginDialog.html';

angular
  .module('confRegistrationWebApp')
  .service('loginDialog', function($injector) {
    this.show = function(options) {
      var loginDialogOptions = {
        templateUrl: template,
        controller: /*@ngInject*/ function(
          $scope,
          $uibModalInstance,
          $location,
          envService,
          $document,
          $http,
        ) {
          $scope.apiUrl = envService.read('apiUrl');
          $scope.clientUrl = window.location.origin;
          $scope.status401 = options.status401;
          $scope.relayLogin =
            options.relayLogin === undefined ? true : options.relayLogin;
          $scope.facebookLogin =
            options.facebookLogin === undefined ? true : options.facebookLogin;
          $scope.googleLogin =
            options.googleLogin === undefined ? true : options.googleLogin;
          $scope.gotoRoute = function(path) {
            $uibModalInstance.dismiss();
            $location.path(path);
          };

          this.$onInit = () => {
            $scope.googleNonce = getGoogleNonce();
          };

          const getGoogleNonce = () =>
            $http
              .get(`auth/google/authorization`)
              .then(response => response.data.googleNonce);

          const loadGoogle = () => {
            const script = $document[0].createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.type = 'text/javascript';
            script.async = true;
            $document[0].body.appendChild(script);
          };
          loadGoogle();
        },
        backdrop: 'static',
        keyboard: false,
      };

      var $uibModal = $injector.get('$uibModal');
      $uibModal.open(loginDialogOptions);
    };
  });
