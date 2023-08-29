import 'angular-mocks';

describe('Directive: datepicker', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope;
  beforeEach(inject(function (_$compile_, _$rootScope_, $templateCache) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    scope = $rootScope.$new();
    $templateCache.put('views/components/graduationDateQuestion.html', '');
    scope.monthYearOnly = true;
    element = $compile(
      '<crs-datetimepicker model="answer.value" month-year-only="true"></crs-datetimepicker>',
    )(scope);
    scope.$digest();
    scope = element.isolateScope() || element.scope();
  }));

  it('Sets localModel', function () {
    scope.updateTimeStamp(new Date('02/05/1994'));

    expect(scope.localModel).toBe('1994-02');
  });
});
