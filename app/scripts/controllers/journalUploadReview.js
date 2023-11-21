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
      const items =
        report.accountTransfers || report.promotionRegistrationInfoList || [];
      $scope.conference = conference;
      $scope.queryParameters = queryParameters;
      $scope.apiUrl = envService.read('apiUrl');
      $scope.authToken = $cookies.get('crsToken');
      $scope.report = report;
      $scope.successCount = items.filter(
        (accountTransfers) => !accountTransfers.error,
      ).length;
      $scope.errorCount = items.filter(
        (accountTransfers) => accountTransfers.error,
      ).length;

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
