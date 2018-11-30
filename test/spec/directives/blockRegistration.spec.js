import 'angular-mocks';

describe('Directive: blockRegistration', function () {

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope, testData;
  beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache, _testData_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    testData = _testData_;

    scope = $rootScope.$new();
    $templateCache.put('views/components/blockRegistration.html', '');

    scope.adminEditRegistrant = testData.registration.registrants[0];
    scope.block = testData.conference.registrationPages[1].blocks[4];

    element = $compile('<div block-registration></div>')(scope);

    scope.$digest();
  }));

  it('is false when choice is undefined', function() {
    expect(element.scope().choiceVisible(scope.block)).toBe(false);
  });

  it('choice should be visible without rules', function() {
    const choice = scope.block.content.choices[0];

    expect(element.scope().choiceVisible(scope.block, choice)).toBe(true);
  });

  it('choice should not be visible with rules', function() {
    // choice is has a value = 23
    // but has rule to be visible if parent value is more than 100
    const choice = scope.block.content.choices[1];

    // selected answer of the parent block is 13
    element.scope().adminEditRegistrant.answers[1].value = 13;

    // so the block shouldn't be visible
    expect(element.scope().choiceVisible(scope.block, choice)).toBe(false);
  });

  it('choice should be visible with fulfilled rules', function() {
    // choice is has a value = 23
    // but has rule to be visible if parent value is more than 100
    const choice = scope.block.content.choices[1];

    // selected value of the parent block is 235246
    // so choice should be visible
    expect(element.scope().choiceVisible(scope.block, choice)).toBe(true);
  });

  it('choice should disappear because the rules became not fulfilled for radioQuestion type', function() {
    // choice is has a value = 23
    // but has rule to be visible if parent value is more than 100
    const choice = scope.block.content.choices[1];

    // selected answer of block to 23
    element.scope().adminEditRegistrant.answers[2].value = '23';

    // change the value of parent block which results in hiding the choice 23
    element.scope().adminEditRegistrant.answers[1].value = '13';

    // so the block shouldn't be visible
    expect(element.scope().choiceVisible(scope.block, choice)).toBe(false);
    // and also current answer should be not selected
    expect(element.scope().adminEditRegistrant.answers[2].value).toBeNull();
  });

  it('choice should disappear because the rules became not fulfilled for checkboxQuestion type', function() {
    // select checkboxQuestion block type
    scope.adminEditRegistrant = testData.registration.registrants[0];
    scope.block = testData.conference.registrationPages[1].blocks[5];
    element = $compile('<div block-registration></div>')(scope);
    scope.$digest();

    // choice is has a value = { 651: true }
    // but has rule to be visible if parent value is less than 100
    const choice = scope.block.content.choices[0];

    // set parent block to hide the choice
    element.scope().adminEditRegistrant.answers[1].value = '101';

    // so the block shouldn't be visible
    expect(element.scope().choiceVisible(scope.block, choice)).toBe(false);
    // and also current answer should be not selected
    expect(element.scope().adminEditRegistrant.answers[4].value['651']).toBeFalsy();
  });
});
