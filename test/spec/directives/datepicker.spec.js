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
    scope.monthYearOnly = true;
    scope.updateTimeStamp(new Date('02/05/1994'));

    expect(scope.localModel).toBe('1994-02-10');

    scope.updateTimeStamp(new Date('02/05/1994 10:11:12'));

    //removes time and sets the day to 10
    expect(scope.localModel).toBe('1994-02-10');

    expect(scope.dateOptions.viewMode).toBe('years');
  });

  it('Sets the date to the correct format for all other types of datepickers', function () {
    scope.monthYearOnly = false;

    scope.updateTimeStamp(new Date('02/05/1994'));

    //adds the time and reformats
    expect(scope.localModel).toBe('1994-02-05 00:00:00');
  });

  it('Sets the initial/default date to the correct value and format based on the localModel', function () {
    let localModel = new Date('01-30-2023 11:01:05');
    let dateOptions = scope.getDateOptions(localModel);

    expect(dateOptions.defaultDate).toBe('2023-01-30 11:01:05');
  });
});
