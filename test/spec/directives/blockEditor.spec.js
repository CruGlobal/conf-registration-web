import 'angular-mocks';

describe('Directive: blockEditor', function() {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope, testData;
  beforeEach(inject(function(
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

  it('updates forceSelection', function() {
    scope.block.content.forceSelections = { someValue: true };

    scope.onChoiceOptionChange();

    expect(scope.block.content.forceSelections['someValue']).toBeUndefined();
  });

  it('should open modal for Advanced Option', function() {
    scope.conference.currency = {
      code: 'USD',
      name: 'US Dollar',
      shortSymbol: 'US',
    };
    scope.editBlockOptionAdvanced();
  });

  it('set new answer rules operand to OR by default', function() {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '18ccfb09-3006-4981-ab5e-bbbbbbbbbbbb',
    });
    scope.block = block;

    scope.editBlockAddOption('EEE');

    expect(scope.block.content.choices[4].operand).toBe('OR');
  });
});
