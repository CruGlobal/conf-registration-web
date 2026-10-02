import 'angular-mocks';

describe('Service: staffLoginWarning', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let staffLoginWarning, $rootScope;

  beforeEach(inject((_staffLoginWarning_, _$rootScope_) => {
    staffLoginWarning = _staffLoginWarning_;
    $rootScope = _$rootScope_;
  }));

  it('names the provider the staff member logged in with', () => {
    staffLoginWarning.show('GOOGLE');

    expect($rootScope.staffLoginWarning).toBe(
      'You have logged in with Google. ERT only works properly for staff if they log in with Okta.',
    );
  });

  it('falls back to a generic provider name', () => {
    staffLoginWarning.show('SOMETHING_NEW');

    expect($rootScope.staffLoginWarning).toContain(
      'You have logged in with a provider other than Okta.',
    );
  });

  it('is cleared when dismissed', () => {
    staffLoginWarning.show('FACEBOOK');
    $rootScope.dismissStaffLoginWarning();

    expect($rootScope.staffLoginWarning).toBe('');
  });
});
