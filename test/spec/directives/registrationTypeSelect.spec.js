import 'angular-mocks';

describe('Directive: registrationTypeSelect', function () {

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope, testData;
  beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache, $routeParams, _testData_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    testData = _testData_;
    angular.extend($routeParams, { regType: testData.conference.registrantTypes[1].id });

    scope = $rootScope.$new();
    $templateCache.put('views/components/registrationTypeSelect.html', '');

    scope.conference = testData.conference;
    scope.currentRegistration = testData.registration;

    scope.currentRegistration.registrants = [];

    element = $compile('<registration-type-select></registration-type-select>')(scope);

    scope.$digest();

    scope = element.isolateScope() || element.scope();
  }));

  it('removes from visibleRegistrantTypes', function() {
    expect(scope.visibleRegistrantTypes.length).toBe(1);
  });

  it('registrationTypeFull should return false when there is no limit', function() {
    var registrationType = testData.conference.registrantTypes[1];

    expect(scope.registrationTypeFull(registrationType)).toBe(false);
  });


});
