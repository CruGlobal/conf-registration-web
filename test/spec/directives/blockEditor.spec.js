import 'angular-mocks';

describe('Directive: blockEditor', function () {

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope, testData;
  beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache, _testData_){
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
    scope.block.content.forceSelections = { 'someValue': true };

    scope.onChoiceOptionChange();

    expect(scope.block.content.forceSelections['someValue']).toBeUndefined();
  });
});
