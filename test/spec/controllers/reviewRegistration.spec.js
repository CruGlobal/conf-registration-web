import 'angular-mocks';

describe('Controller: ReviewRegistrationCtrl', function() {
  var scope;
  var mockWindow;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(function($rootScope, $controller, testData) {
      scope = $rootScope.$new();
      mockWindow = {
        location: {
          href: '',
        },
      };
      scope.answers = testData.registration.registrants[0].answers;

      $controller('ReviewRegistrationCtrl', {
        $scope: scope,
        currentRegistration: testData.registration,
        conference: testData.conference,
        $window: mockWindow,
      });
    }),
  );

  it('findAnswer should return answer', function() {
    expect(scope.findAnswer('9b83eebd-b064-4edf-92d0-7982a330272a').value).toBe(
      'M',
    );
  });

  it('blockVisibleForRegistrant should be true', function() {
    expect(
      scope.blockVisibleForRegistrant(
        scope.conference.registrationPages[1].blocks[0],
        scope.currentRegistration.registrants[0],
      ),
    ).toBe(true);
  });

  it('registrantDeletable should be possible when allowEditRegistrationAfterComplete set to true', function() {
    scope.conference.allowEditRegistrationAfterComplete = true;

    expect(
      scope.registrantDeletable({
        registrantTypeId: '2b7ca963-0503-47c4-b9cf-6348d59542c3',
      }),
    ).toBe(true);
  });

  it('registrantDeletable should not be possible when allowEditRegistrationAfterComplete set to false', function() {
    scope.conference.allowEditRegistrationAfterComplete = false;

    expect(scope.registrantDeletable({})).toBe(false);
  });

  it('registrantDeletable should not be possible when removing primary registrant', function() {
    scope.conference.allowEditRegistrationAfterComplete = true;

    expect(
      scope.registrantDeletable({
        id: scope.currentRegistration.primaryRegistrantId,
      }),
    ).toBe(false);
  });

  it('confirmRegistration should redirect to the primary registrant type redirect url', function() {
    scope.currentRegistration.completed = true;
    scope.navigateToPostRegistrationPage();

    expect(mockWindow.location.href).toEqual('url2.com');
  });
});
