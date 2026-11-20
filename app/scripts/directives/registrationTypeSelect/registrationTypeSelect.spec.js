import 'angular-mocks';

describe('Directive: registrationTypeSelect', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope, testData;
  beforeEach(inject(function (
    _$compile_,
    _$rootScope_,
    $templateCache,
    $routeParams,
    _testData_,
  ) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    testData = _testData_;
    angular.extend($routeParams, {
      regType: testData.conference.registrantTypes[1].id,
    });

    scope = $rootScope.$new();
    $templateCache.put(
      'scripts/directives/registrationTypeSelect/registrationTypeSelect.html',
      '',
    );

    scope.conference = testData.conference;
    scope.currentRegistration = testData.registration;

    scope.currentRegistration.registrants = [];

    element = $compile('<registration-type-select></registration-type-select>')(
      scope,
    );

    scope.$digest();

    scope = element.isolateScope() || element.scope();
  }));

  it('removes from visibleRegistrantTypes', function () {
    expect(scope.visibleRegistrantTypes.length).toBe(1);
  });

  describe('registrationTypeFull', () => {
    let registrantTypeSingle, registrantTypeDouble, registrantTypeExempt;
    beforeEach(() => {
      registrantTypeSingle = testData.conference.registrantTypes[0];
      registrantTypeDouble = testData.conference.registrantTypes[1];
      registrantTypeExempt = testData.conference.registrantTypes[2];
      scope.currentRegistration.registrants = [
        { registrantTypeId: registrantTypeSingle.id },
        { registrantTypeId: registrantTypeDouble.id },
        { registrantTypeId: registrantTypeDouble.id },
      ];
    });

    it('should return false when there is no limit', () => {
      expect(scope.registrationTypeFull(registrantTypeDouble)).toBe(false);
    });

    it('should return true when conference has 1 available slot and there are 3 registrants', () => {
      scope.conference.useTotalCapacity = true;
      scope.conference.availableCapacity = 1;

      expect(scope.registrationTypeFull(registrantTypeDouble)).toBe(true);
    });

    it('should return true when registration type has 1 available slot and 2 registrants of that type', () => {
      registrantTypeDouble.useLimit = true;
      registrantTypeDouble.availableSlots = 1;

      expect(scope.registrationTypeFull(registrantTypeDouble)).toBe(true);
    });

    it('should return false when registration type has 1 available slot and 1 registrant of that type', () => {
      registrantTypeDouble.useLimit = true;
      registrantTypeDouble.availableSlots = 1;

      expect(scope.registrationTypeFull(registrantTypeSingle)).toBe(false);
    });

    it('should return false for couple types when registration type has 1 available slot', () => {
      const registrationTypeCouple = {
        ...registrantTypeSingle,
        defaultTypeKey: 'COUPLE',
      };

      scope.currentRegistration.registrants = [];
      registrantTypeDouble.useLimit = true;
      registrantTypeDouble.availableSlots = 1;

      expect(scope.registrationTypeFull(registrationTypeCouple)).toBe(false);
    });

    it('should not count exempt registrants toward conference capacity', () => {
      // registrantTypeExempt has exemptFromConferenceCapacity as true
      scope.conference.useTotalCapacity = true;
      scope.conference.availableCapacity = 2;

      scope.currentRegistration.registrants = [
        { registrantTypeId: registrantTypeSingle.id },
        { registrantTypeId: registrantTypeExempt.id },
        { registrantTypeId: registrantTypeExempt.id },
      ];

      expect(scope.registrationTypeFull(registrantTypeSingle)).toBe(false);
    });

    it('should return true when non-exempt registrants exceed capacity', () => {
      scope.conference.useTotalCapacity = true;
      scope.conference.availableCapacity = 1;

      scope.currentRegistration.registrants = [
        { registrantTypeId: registrantTypeSingle.id },
        { registrantTypeId: registrantTypeSingle.id },
      ];

      expect(scope.registrationTypeFull(registrantTypeSingle)).toBe(true);
    });

    it('should allow registration when only exempt registrants exist', () => {
      scope.conference.useTotalCapacity = true;
      scope.conference.availableCapacity = 1;

      scope.currentRegistration.registrants = [
        { registrantTypeId: registrantTypeExempt.id },
        { registrantTypeId: registrantTypeExempt.id },
        { registrantTypeId: registrantTypeExempt.id },
      ];

      expect(scope.registrationTypeFull(registrantTypeSingle)).toBe(false);
    });
  });

  describe('newRegistrant', () => {
    let analytics, RegistrationCache, registrantTypeId;
    beforeEach(inject((_analytics_, _RegistrationCache_, modalMessage) => {
      analytics = _analytics_;
      RegistrationCache = _RegistrationCache_;
      registrantTypeId = testData.conference.registrantTypes[0].id;
      spyOn(analytics, 'trackAddToCart');
      spyOn(modalMessage, 'error');
      // The save succeeds right away unless a test says otherwise.
      spyOn(RegistrationCache, 'update').and.callFake(
        (path, registration, onSuccess) => onSuccess(),
      );
    }));

    it('sends GA4 add_to_cart for the new registrant once they are saved', () => {
      scope.newRegistrant(registrantTypeId);
      const newRegistrant = scope.currentRegistration.registrants.at(-1);

      expect(analytics.trackAddToCart).toHaveBeenCalledWith(
        testData.conference,
        scope.currentRegistration,
        registrantTypeId,
        newRegistrant.id,
      );
    });

    it('does not send add_to_cart when the save fails', () => {
      RegistrationCache.update.and.callFake(
        (path, registration, onSuccess, onError) => onError(),
      );
      scope.newRegistrant(registrantTypeId);

      expect(analytics.trackAddToCart).not.toHaveBeenCalled();
    });

    it('does not send add_to_cart in preview mode', () => {
      $rootScope.registerMode = 'preview';
      scope.newRegistrant(registrantTypeId);

      expect(analytics.trackAddToCart).not.toHaveBeenCalled();
    });
  });
});
