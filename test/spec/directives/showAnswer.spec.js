import 'angular-mocks';

describe('Directive: showAnswer', function() {
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
    $templateCache.put('views/components/answerDisplay.html', '');

    scope.block = testData.conference.registrationPages[1].blocks[4];

    element = $compile('<show-answer></show-answer>')(scope);

    scope.$digest();
  }));

  it('choiceVisible is false when choice is undefined', function() {
    expect(element.isolateScope().choiceVisible(scope.block)).toBe(false);
  });
});
