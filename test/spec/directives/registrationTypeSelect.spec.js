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
    $templateCache.put('views/components/registrationTypeSelect.html', '');

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
    let registrantTypeSingle, registrantTypeDouble;
    beforeEach(() => {
      registrantTypeSingle = testData.conference.registrantTypes[0];
      registrantTypeDouble = testData.conference.registrantTypes[1];
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
      scope.conference.useLimit = true;
      scope.conference.availableSlots = 1;

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
  });
});
