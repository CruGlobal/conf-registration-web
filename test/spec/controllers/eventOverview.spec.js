import 'angular-mocks';

describe('Controller: eventOverview', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let scope;
  let testData;
  let RegistrationCache;
  let $q;
  let $rootScope;

  beforeEach(
    angular.mock.inject(
      (_$rootScope_, $controller, _testData_, _RegistrationCache_, _$q_) => {
        testData = _testData_;
        RegistrationCache = _RegistrationCache_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();

        spyOn(RegistrationCache, 'getAllForConference').and.returnValue(
          $q.resolve({
            registrations: [],
          }),
        );

        $controller('eventOverviewCtrl', {
          $scope: scope,
          $rootScope: $rootScope,
          conference: testData.conference,
        });
      },
    ),
  );

  it('sets registrationUrl', () => {
    expect(scope.registrationUrl).toBeDefined();
  });

  it('should call RegistrationCache.getAllForConference on initialization', () => {
    expect(RegistrationCache.getAllForConference).toHaveBeenCalledWith(
      testData.conference.id,
      {
        includeCheckedin: 'yes',
        includeWithdrawn: 'no',
        includeIncomplete: 'no',
      },
    );
  });

  describe('when registrations are loaded', () => {
    it('should update completedRegistrationCount to reflect number of registrants', () => {
      const mockRegistrations = [
        { id: 'reg1' },
        { id: 'reg2' },
        { id: 'reg3' },
      ];

      RegistrationCache.getAllForConference.and.returnValue(
        $q.resolve({
          registrations: mockRegistrations,
        }),
      );

      const newScope = $rootScope.$new();

      inject(($controller) => {
        $controller('eventOverviewCtrl', {
          $scope: newScope,
          $rootScope: $rootScope,
          conference: angular.copy(testData.conference),
        });
      });

      expect(newScope.conference.completedRegistrationCount).toBe(
        testData.conference.completedRegistrationCount,
      );

      $rootScope.$digest();

      expect(newScope.conference.completedRegistrationCount).toBe(
        mockRegistrations.length,
      );
    });
  });
});
