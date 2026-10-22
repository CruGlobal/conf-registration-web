import 'angular-mocks';

describe('Service: staffLoginWarning', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let staffLoginWarning, modalMessage;

  beforeEach(inject((_staffLoginWarning_, _modalMessage_) => {
    staffLoginWarning = _staffLoginWarning_;
    modalMessage = _modalMessage_;
    spyOn(modalMessage, 'error');
  }));

  it('opens a modal naming the provider the staff member logged in with', () => {
    staffLoginWarning.show('GOOGLE');

    expect(modalMessage.error).toHaveBeenCalledWith({
      title: 'Please log in with Okta',
      message:
        'You have logged in with Google. ERT only works properly for staff if they log in with Okta.',
      forceAction: true,
    });
  });

  it('falls back to a generic provider name', () => {
    staffLoginWarning.show('SOMETHING_NEW');

    expect(modalMessage.error.calls.mostRecent().args[0].message).toContain(
      'You have logged in with a provider other than Okta.',
    );
  });
});
