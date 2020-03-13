import 'angular-mocks';

describe('Directive: registrationTypeSelect visibleRegistrantTypes', function() {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope, testRegistrantTypeData;
  beforeEach(inject(function(
    _$compile_,
    _$rootScope_,
    $templateCache,
    $routeParams,
    _testRegistrantTypeData_,
  ) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    testRegistrantTypeData = _testRegistrantTypeData_;

    scope = $rootScope.$new();
    $templateCache.put('views/components/registrationTypeSelect.html', '');

    scope.conference = testRegistrantTypeData.conference;
    scope.currentRegistration = testRegistrantTypeData.registration;
  }));

  it('on the first registration screen all group and non-group registrant types are visible (except dependant)', function() {
    // no registrants yet
    scope.currentRegistration.registrants = [];
    element = $compile('<registration-type-select></registration-type-select>')(
      scope,
    );
    scope.$digest();
    scope = element.isolateScope() || element.scope();

    const typeNames = _.map(scope.visibleRegistrantTypes, 'name');
    expect(typeNames.length).toBe(5);
    expect(typeNames).toContain('Default');
    expect(typeNames).toContain('Group 1');
    expect(typeNames).toContain('Group 2');
    expect(typeNames).toContain('Group 3');
    expect(typeNames).toContain('Group 2 Non-Group 1');
  });

  it('when Group 1 selected on the first screen, only associated registrant types visible on review screen', function() {
    element = $compile('<registration-type-select></registration-type-select>')(
      scope,
    );
    scope.$digest();
    scope = element.isolateScope() || element.scope();

    const typeNames = _.map(scope.visibleRegistrantTypes, 'name');
    expect(typeNames.length).toBe(2);
    expect(typeNames).toContain('Group 1 Dependant 1');
    expect(typeNames).toContain('Group 1 Dependant 2');
  });

  it('when Group 2 selected on the first screen, only associated registrant types visible on review screen', function() {
    const group2Id = _.find(scope.conference.registrantTypes, {
      name: 'Group 2',
    }).id;
    scope.currentRegistration.registrants[0].registrantTypeId = group2Id;
    element = $compile('<registration-type-select></registration-type-select>')(
      scope,
    );
    scope.$digest();
    scope = element.isolateScope() || element.scope();

    const typeNames = _.map(scope.visibleRegistrantTypes, 'name');
    expect(typeNames.length).toBe(2);
    expect(typeNames).toContain('Group 2 Non-Group 1');
    expect(typeNames).toContain('Group 2 Dependant 2');
  });

  it('when childRegistrantTypes set to null, fallback for already created conferences', function() {
    scope.conference.registrantTypes[1].allowedRegistrantTypeSet = null;
    element = $compile('<registration-type-select></registration-type-select>')(
      scope,
    );
    scope.$digest();
    scope = element.isolateScope() || element.scope();

    const typeNames = _.map(scope.visibleRegistrantTypes, 'name');
    expect(typeNames.length).toBe(8);
    expect(typeNames).toContain('Default');
    expect(typeNames).toContain('Group 1');
    expect(typeNames).toContain('Group 2');
    expect(typeNames).toContain('Group 3');
    expect(typeNames).toContain('Group 1 Dependant 2');
    expect(typeNames).toContain('Group 1 Dependant 2');
    expect(typeNames).toContain('Group 2 Non-Group 1');
    expect(typeNames).toContain('Group 2 Dependant 2');
  });

  it('when Group 3 selected on the first screen, other associated Primary Group Registrant Types are visible (including itself)', function() {
    const group3Id = _.find(scope.conference.registrantTypes, {
      name: 'Group 3',
    }).id;
    scope.currentRegistration.registrants[0].registrantTypeId = group3Id;
    element = $compile('<registration-type-select></registration-type-select>')(
      scope,
    );
    scope.$digest();
    scope = element.isolateScope() || element.scope();

    const typeNames = _.map(scope.visibleRegistrantTypes, 'name');
    expect(typeNames.length).toBe(3);
    expect(typeNames).toContain('Group 1');
    expect(typeNames).toContain('Group 3');
    expect(typeNames).toContain('Group 2 Dependant 2');
  });

  it('associated registrant types can be limited', function() {
    scope.currentRegistration = testRegistrantTypeData.registrationWithLimit;
    element = $compile('<registration-type-select></registration-type-select>')(
      scope,
    );
    scope.$digest();
    scope = element.isolateScope() || element.scope();

    const typeNames = _.map(scope.visibleRegistrantTypes, 'name');
    expect(typeNames.length).toBe(1);
    expect(typeNames).toContain('Group 1 Dependant 1');
  });

  it('associated registrant types can be unlimited', function() {
    scope.currentRegistration = testRegistrantTypeData.registrationWithLimit;
    scope.conference.registrantTypes[1].allowedRegistrantTypeSet[1].numberOfChildRegistrants = 0;
    element = $compile('<registration-type-select></registration-type-select>')(
      scope,
    );
    scope.$digest();
    scope = element.isolateScope() || element.scope();

    const typeNames = _.map(scope.visibleRegistrantTypes, 'name');
    expect(typeNames.length).toBe(2);
    expect(typeNames).toContain('Group 1 Dependant 1');
    expect(typeNames).toContain('Group 1 Dependant 2');
  });

  it('current registration is non-group', function() {
    scope.currentRegistration = testRegistrantTypeData.registrationDefault;
    element = $compile('<registration-type-select></registration-type-select>')(
      scope,
    );
    scope.$digest();
    scope = element.isolateScope() || element.scope();

    const typeNames = _.map(scope.visibleRegistrantTypes, 'name');
    expect(typeNames.length).toBe(8);
  });
});
