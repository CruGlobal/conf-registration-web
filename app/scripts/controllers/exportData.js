angular
  .module('confRegistrationWebApp')
  .controller(
    'exportDataModal',
    function ($scope, $uibModalInstance, $cookies, conference, envService) {
      $scope.conference = conference;
      $scope.apiUrl = envService.read('apiUrl');
      $scope.authToken = $cookies.get('crsToken');

      $scope.close = function () {
        $uibModalInstance.dismiss();
      };
    },
  );
