import 'angular-mocks';

describe('Directive: blockEditor', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope, testData;
  beforeEach(inject(function (
    _$compile_,
    _$rootScope_,
    $templateCache,
    _testData_,
  ) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    testData = _testData_;

    scope = $rootScope.$new();
    $templateCache.put('views/components/blockEditor.html', '');

    scope.conference = testData.conference;
    scope.block = testData.conference.registrationPages[1].blocks[5];

    element = $compile('<div block-editor></div>')(scope);
    scope.$digest();

    scope = element.isolateScope() || element.scope();
  }));

  it('updates forceSelection', function () {
    scope.block.content.forceSelections = { someValue: true };

    scope.onChoiceOptionChange();

    expect(scope.block.content.forceSelections['someValue']).toBeUndefined();
  });

  it('should open modal for Advanced Option', function () {
    scope.conference.currency = {
      code: 'USD',
      name: 'US Dollar',
      shortSymbol: 'US',
    };
    scope.editBlockOptionAdvanced();
  });

  it('set new answer rules operand to OR by default', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '18ccfb09-3006-4981-ab5e-bbbbbbbbbbbb',
    });
    scope.block = block;

    scope.editBlockAddOption('EEE');

    expect(scope.block.content.choices[4].operand).toBe('OR');
  });

  it('should not create an error message if there are not multiple questions with the same Cru Profile type', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '9b83eebd-b064-4edf-92d0-7982a330272b',
    });
    scope.block = block;
    scope.block.profileType = null;

    scope.toggleProfileType(true);

    expect(scope.pType).toBeUndefined();
  });

  it('Duplicate Cru Profile Gender Question: Changes gender to sex in error message', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '9b83eebd-b064-4edf-92d0-7982a330272a',
    });
    scope.block = block;

    scope.toggleProfileType(true);

    expect(scope.pType).toBe('Sex');
  });
});
