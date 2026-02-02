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

  describe('isRegistrationClosed', () => {
    it('returns true when conference is manually closed', () => {
      scope.conference.manuallyClosed = true;
      scope.conference.registrationOpen = true;

      expect(scope.isRegistrationClosed()).toBe(true);
    });

    it('returns true when useTotalCapacity is true and availableCapacity is 0', () => {
      scope.conference.manuallyClosed = false;
      scope.conference.useTotalCapacity = true;
      scope.conference.availableCapacity = 0;
      scope.conference.registrationOpen = true;

      expect(scope.isRegistrationClosed()).toBe(true);
    });

    it('returns true when useTotalCapacity is true and availableCapacity is negative', () => {
      scope.conference.manuallyClosed = false;
      scope.conference.useTotalCapacity = true;
      scope.conference.availableCapacity = -5;
      scope.conference.registrationOpen = true;

      expect(scope.isRegistrationClosed()).toBe(true);
    });

    it('returns true when registration is not open', () => {
      scope.conference.manuallyClosed = false;
      scope.conference.useTotalCapacity = false;
      scope.conference.registrationOpen = false;

      expect(scope.isRegistrationClosed()).toBe(true);
    });

    it('returns false when registration is open and not at capacity', () => {
      scope.conference.manuallyClosed = false;
      scope.conference.useTotalCapacity = true;
      scope.conference.availableCapacity = 10;
      scope.conference.registrationOpen = true;

      expect(scope.isRegistrationClosed()).toBe(false);
    });

    it('returns false when registration is open and capacity is not used', () => {
      scope.conference.manuallyClosed = false;
      scope.conference.useTotalCapacity = false;
      scope.conference.registrationOpen = true;

      expect(scope.isRegistrationClosed()).toBe(false);
    });
  });
});
