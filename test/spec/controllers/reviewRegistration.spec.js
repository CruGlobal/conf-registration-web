import 'angular-mocks';

describe('Controller: ReviewRegistrationCtrl', function () {
  let scope;
  let testData;
  let mockWindow;
  let initController;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(function ($rootScope, $controller, _testData_) {
      testData = _testData_;

      initController = (injected) => {
        scope = $rootScope.$new();
        mockWindow = {
          location: {
            href: '',
          },
        };
        scope.answers = testData.registration.registrants[0]?.answers ?? [];

        $controller('ReviewRegistrationCtrl', {
          $scope: scope,
          currentRegistration: testData.registration,
          conference: testData.conference,
          $window: mockWindow,
          ...injected,
        });
      };
      initController();
    }),
  );

  describe('allowGroupRegistration', () => {
    it('is false when there are no registrants', () => {
      testData.registration.registrants = [];
      initController();

      expect(scope.allowGroupRegistration()).toBe(false);
    });

    it('is false when allowGroupRegistrations is false for all registrant types', () => {
      testData.conference.registrantTypes[1].allowGroupRegistrations = false;
      initController();

      expect(scope.allowGroupRegistration()).toBe(false);
    });

    it('is true when allowGroupRegistrations is true for one registrant type', () => {
      expect(scope.allowGroupRegistration()).toBe(true);
    });
  });

  describe('currentPayment', () => {
    it('should have balance set to the remaining balance', () => {
      expect(scope.currentPayment.amount).toBe(
        testData.registration.remainingBalance,
      );
    });
  });

  describe('findAnswer', () => {
    it('finds an answer by its block id', () => {
      const answer = testData.registration.registrants[0].answers[0];

      expect(scope.findAnswer(answer.blockId)).toBe(answer);
    });
  });

  describe('getBlock', () => {
    it('finds a block by its id', () => {
      const block = testData.conference.registrationPages[0].blocks[0];

      expect(scope.getBlock(block.id)).toBe(block);
    });
  });

  describe('registerDisabled', () => {
    it('is true in preview mode', () => {
      scope.registerMode = 'preview';

      expect(scope.registerDisabled()).toBe(true);
    });

    it('is true with invalid registrants', () => {
      spyOn(scope, 'allRegistrantsValid').and.returnValue(false);

      expect(scope.registerDisabled()).toBe(true);
    });

    it('is true while submitting', () => {
      scope.confirmRegistration();

      expect(scope.registerDisabled()).toBe(true);
    });

    it('is false otherwise', () => {
      spyOn(scope, 'allRegistrantsValid').and.returnValue(true);

      expect(scope.registerDisabled()).toBe(false);
    });
  });

  describe('pageIsVisible', () => {
    it('returns true if any blocks are visible', () => {
      initController({
        validateRegistrant: {
          blockVisible: () => true,
          validate: () => [],
        },
      });

      expect(
        scope.pageIsVisible(testData.conference.registrationPages[0]),
      ).toBe(true);
    });

    it('returns false if no blocks are visible', () => {
      initController({
        validateRegistrant: {
          blockVisible: () => false,
          validate: () => [],
        },
      });

      expect(
        scope.pageIsVisible(testData.conference.registrationPages[0]),
      ).toBe(false);
    });
  });

  describe('isBlockInvalid', () => {
    const blockId = 'block-1';
    let registrantId;
    beforeEach(() => {
      registrantId = testData.registration.registrants[0].id;
    });

    it('returns false when there are no errors', () => {
      initController({
        validateRegistrant: {
          validate: () => [],
        },
      });

      expect(scope.isBlockInvalid(registrantId, blockId)).toBe(false);
    });

    it('returns true when there are errors', () => {
      initController({
        validateRegistrant: {
          validate: () => [blockId],
        },
      });

      expect(scope.isBlockInvalid(registrantId, blockId)).toBe(true);
    });
  });

  describe('allRegistrantsValid', () => {
    it('returns true when there are no errors', () => {
      initController({
        validateRegistrant: {
          validate: () => [],
        },
      });

      expect(scope.allRegistrantsValid()).toBe(true);
    });

    it('returns false when there are errors', () => {
      initController({
        validateRegistrant: {
          validate: () => ['block-1'],
        },
      });

      expect(scope.allRegistrantsValid()).toBe(false);
    });
  });

  describe('blockVisibleForRegistrant', () => {
    it('should return true for visible blocks', () => {
      expect(
        scope.blockVisibleForRegistrant(
          scope.conference.registrationPages[1].blocks[0],
          scope.currentRegistration.registrants[0],
        ),
      ).toBe(true);
    });
  });

  describe('acceptedPaymentMethods', () => {
    it('calculates accepted payment methods for the registrant types', () => {
      expect(scope.acceptedPaymentMethods()).toEqual({
        acceptCreditCards: true,
        acceptChecks: true,
        acceptTransfers: true,
        acceptScholarships: false,
        acceptPayOnSite: false,
      });
    });

    describe('acceptPayOnSite', () => {
      it('is true on incomplete registrations', () => {
        testData.conference.registrantTypes[1].acceptPayOnSite = true;
        testData.registration.completed = false;
        initController();

        expect(scope.acceptedPaymentMethods().acceptPayOnSite).toBe(true);
      });

      it('is false on completed registrations', () => {
        testData.conference.registrantTypes[1].acceptPayOnSite = true;
        testData.registration.completed = true;
        initController();

        expect(scope.acceptedPaymentMethods().acceptPayOnSite).toBe(false);
      });
    });

    it('returns false when no payment methods are accepted', () => {
      testData.conference.registrantTypes.forEach((registrantType) => {
        Object.assign(registrantType, {
          acceptCreditCards: false,
          acceptTransfers: false,
          acceptScholarships: false,
          acceptChecks: false,
        });
      });
      initController();

      expect(scope.acceptedPaymentMethods()).toBe(false);
    });
  });

  it('registrantDeletable should be possible when allowEditRegistrationAfterComplete set to true', function () {
    scope.conference.allowEditRegistrationAfterComplete = true;

    expect(
      scope.registrantDeletable({
        registrantTypeId: '2b7ca963-0503-47c4-b9cf-6348d59542c3',
      }),
    ).toBe(true);
  });

  it('registrantDeletable should not be possible when allowEditRegistrationAfterComplete set to false', function () {
    scope.conference.allowEditRegistrationAfterComplete = false;

    expect(scope.registrantDeletable({})).toBe(false);
  });

  it('registrantDeletable should not be possible when removing primary registrant', function () {
    scope.conference.allowEditRegistrationAfterComplete = true;

    expect(
      scope.registrantDeletable({
        id: scope.currentRegistration.primaryRegistrantId,
      }),
    ).toBe(false);
  });

  it('confirmRegistration should redirect to the primary registrant type redirect url', function () {
    scope.currentRegistration.completed = true;
    scope.navigateToPostRegistrationPage();

    expect(mockWindow.location.href).toEqual('url2.com');
  });

  describe('hasPendingPayments ', () => {
    it('returns true if there are requested payments', () => {
      expect(
        scope.hasPendingPayments([
          { status: 'REQUESTED' },
          { status: 'APPROVED' },
        ]),
      ).toBe(true);
    });

    it('returns true if there are pending payments', () => {
      expect(
        scope.hasPendingPayments([
          { status: 'PENDING' },
          { status: 'APPROVED' },
        ]),
      ).toBe(true);
    });

    it('returns false otherwise', () => {
      expect(scope.hasPendingPayments([{ status: 'APPROVED' }])).toBe(false);
    });
  });

  describe('hasPendingCheckPayment', () => {
    it('returns true if there are pending check payments', () => {
      expect(
        scope.hasPendingCheckPayment([
          { paymentType: 'CHECK', status: 'PENDING' },
        ]),
      ).toBe(true);
    });

    it('returns false otherwise', () => {
      expect(
        scope.hasPendingCheckPayment([
          { paymentType: 'CASH', status: 'PENDING' },
          { paymentType: 'CHECK', status: 'RECEIVED' },
        ]),
      ).toBe(false);
    });
  });
});
