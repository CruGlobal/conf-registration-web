import 'angular-mocks';

describe('Directive: staffAccountNotice', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var scope, $compile;
  beforeEach(inject(function (_$rootScope_, _$compile_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
  }));

  function render(accountType) {
    scope.accountType = accountType;
    var element = $compile(
      '<staff-account-notice account-type="accountType"></staff-account-notice>',
    )(scope);
    scope.$digest();
    return element;
  }

  it('shows the notice for a STAFF account', () => {
    expect(render('STAFF').find('.alert').length).toBe(1);
  });

  it('hides the notice for non-STAFF account types', () => {
    expect(render('MINISTRY').find('.alert').length).toBe(0);
    expect(render('NON_US_STAFF').find('.alert').length).toBe(0);
  });
});
