import 'angular-mocks';

describe('Controller: eventOverview', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let scope;
  let testData;

  beforeEach(
    angular.mock.inject(($rootScope, $controller, _testData_) => {
      testData = _testData_;
      scope = $rootScope.$new();

      $controller('eventOverviewCtrl', {
        $scope: scope,
        $rootScope: $rootScope,
        conference: testData.conference,
      });
    }),
  );
});
