import 'angular-mocks';

describe('Directive: rule', function () {

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope, testData;
  beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache, _testData_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    testData = _testData_;

    scope = $rootScope.$new();
    $templateCache.put('views/components/rule.html', '');

    scope.conference = testData.conference;

    const block = _.find(testData.conference.registrationPages[1].blocks, {id: '18ccfb09-3006-4981-ab5e-bbbbbbbbbbbb'});

    scope.block = block

    element = $compile('<rule rule-type="SHOW_OPTION" block="block" />')(scope);
    scope.$digest();

    scope = element.isolateScope() || element.scope();
  }));

  it('defaults answers operand to OR value', function() {

    const choiceCCC = _.find(scope.block.content.choices, { 'value' : 'CCC'});
    const choiceDDD = _.find(scope.block.content.choices, { 'value' : 'DDD'});

    expect(choiceCCC.operand).toBe('OR');
    expect(choiceDDD.operand).toBe('OR');
  });

});
