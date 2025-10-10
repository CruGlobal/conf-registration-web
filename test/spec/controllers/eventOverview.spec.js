import 'angular-mocks';

describe('Controller: eventOverview', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let scope;
  let testData;
  let $rootScope;

  beforeEach(
    angular.mock.inject((_$rootScope_, $controller, _testData_) => {
      testData = _testData_;
      $rootScope = _$rootScope_;
      scope = $rootScope.$new();

      $controller('eventOverviewCtrl', {
        $scope: scope,
        $rootScope: $rootScope,
        conference: testData.conference,
      });
    }),
  );

  it('sets registrationUrl', () => {
    expect(scope.registrationUrl).toBeDefined();
  });
});
