angular
  .module('confRegistrationWebApp')
  .controller(
    'journalUploadReviewModal',
    function (
      $scope,
      $uibModalInstance,
      $cookies,
      conference,
      queryParameters,
      report,
      envService,
    ) {
      $scope.conference = conference;
      $scope.queryParameters = queryParameters;
      $scope.apiUrl = envService.read('apiUrl');
      $scope.authToken = $cookies.get('crsToken');
      $scope.report = report;
      $scope.accountTransfers = $scope.report.accountTransfers.filter(
        (accountTransfers) => !accountTransfers.error,
      );
      $scope.accountTransfersWithErrors = $scope.report.accountTransfers.filter(
        (accountTransfers) => accountTransfers.error,
      );

      $scope.close = () => $uibModalInstance.close();

      $scope.viewErrors = () => {
        queryParameters.filterAccountTransferErrors = 'only';
        $uibModalInstance.close();
      };
      $scope.viewReport = () => {
        $uibModalInstance.close(report.id);
      };
    },
  );
