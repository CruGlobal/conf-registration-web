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

  it('Sets the date to the correct format for the graduation date question datepicker', function () {
    scope.updateTimeStamp(new Date('02/05/1994'));

    expect(scope.localModel).toBe('1994-02-10');

    scope.updateTimeStamp(new Date('02/05/1994 10:11:12'));

    expect(scope.localModel).toBe('1994-02-10');

    expect(scope.dateOptions.viewMode).toBe('years');
  });

  it('Sets the date to the correct format for all other types of datepickers', function () {
    scope.monthYearOnly = false;

    scope.updateTimeStamp(new Date('02/05/1994'));

    expect(scope.localModel).toBe('1994-02-05 00:00:00');
  });
});
