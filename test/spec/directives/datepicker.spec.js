import 'angular-mocks';

describe('Directive: datepicker', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope;
  beforeEach(inject(function (_$compile_, _$rootScope_, $templateCache) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    scope = $rootScope.$new();
    $templateCache.put('views/components/graduationDateQuestion.html', '');
    element = $compile(
      '<crs-datetimepicker model="answer.value" input-id="input-{{1}}"</crs-datetimepicker>',
    )(scope);
    scope.$digest();
    scope = element.isolateScope() || element.scope();
  }));

  it('Sets the date to the correct format for the graduation date question (monthYearOnly) datepicker', function () {
    element = $compile(
      '<crs-datetimepicker model="answer.value" month-year-only="true"></crs-datetimepicker>',
    )(scope);
    scope.$digest();
    scope = element.isolateScope() || element.scope();

    scope.updateTimeStamp(new Date('02/05/1994'));
    //sets the day to 10
    expect(scope.localModel).toBe('1994-02-10');

    scope.updateTimeStamp(new Date('02/05/1994 10:11:12'));
    //removes time and sets the day to 10
    expect(scope.localModel).toBe('1994-02-10');

    //expects dateOptions to be set with custom parameters for the datepicker
    expect(Object.keys(scope.dateOptions).length).toBe(7);

    expect(scope.dateOptions.viewMode).toBe('years');
  });

  it('Sets the date to the correct format for all other types of datepickers', function () {
    scope.updateTimeStamp(new Date('02/05/1994'));
    //adds the time and reformats
    expect(scope.localModel).toBe('1994-02-05 00:00:00');

    scope.getDateOptions();
    //only sets the default date and all other date options are left to be the default
    expect(Object.keys(scope.dateOptions).length).toBe(1);

    expect(scope.dateOptions.viewMode).toBeUndefined();
  });

  it('Sets the initial/default date to the correct value and format based on the localModel', function () {
    scope.localModel = new Date('01-30-2023 11:01:05');
    let dateOptions = scope.getDateOptions();

    expect(dateOptions.defaultDate).toBe('2023-01-30 11:01:05');

    //if the API provides a date without the time
    scope.localModel = new Date('01-30-2023');
    dateOptions = scope.getDateOptions();

    expect(dateOptions.defaultDate).toBe('2023-01-30 00:00:00');
  });

  it("sets the input's id", function () {
    expect(element.find('input').attr('id')).toBe('input-1');
  });
});
