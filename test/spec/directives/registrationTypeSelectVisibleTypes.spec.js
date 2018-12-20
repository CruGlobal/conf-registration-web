import 'angular-mocks';

describe('Directive: registrationTypeSelect visibleRegistrantTypes', function () {

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope, testRegistrantTypeData;
  beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache, $routeParams, _testRegistrantTypeData_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    testRegistrantTypeData = _testRegistrantTypeData_;
    angular.extend($routeParams, { regType: testRegistrantTypeData.conference.registrantTypes[1].id });

    scope = $rootScope.$new();
    $templateCache.put('views/components/registrationTypeSelect.html', '');

    scope.conference = testRegistrantTypeData.conference;
    scope.currentRegistration = testRegistrantTypeData.registration;

    scope.currentRegistration.registrants = [];

    element = $compile('<registration-type-select></registration-type-select>')(scope);

    scope.$digest();

    scope = element.isolateScope() || element.scope();
  }));

  it('removes from visibleRegistrantTypes', function() {
    expect(scope.visibleRegistrantTypes.length).toBe(1);
  });

  it('registrationTypeFull should return false when there is no limit', function() {
    var registrationType = testRegistrantTypeData.conference.registrantTypes[1];

    expect(scope.registrationTypeFull(registrationType)).toBe(false);
  });

  
});
