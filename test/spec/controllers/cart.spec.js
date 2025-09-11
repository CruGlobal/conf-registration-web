import angular from 'angular';
import 'angular-mocks';

describe('Controller: cartCtrl', () => {
  let scope,
    $rootScope,
    $controller,
    $location,
    $q,
    modalMessage,
    mockConference,
    mockConference2,
    mockRegistration,
    mockRegistration2,
    cart,
    registration;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(
      (
        _$controller_,
        _$location_,
        _$rootScope_,
        _$q_,
        _modalMessage_,
        testData,
        _cart_,
        _registration_,
      ) => {
        $controller = _$controller_;
        $location = _$location_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        modalMessage = _modalMessage_;
        cart = _cart_;
        registration = _registration_;
        mockConference = testData.conference;
        mockRegistration = testData.incompleteRegistration;
        mockConference2 = testData.conference2;
        mockRegistration2 = testData.incompleteRegistration2;
        spyOn(cart, 'loadRegistrations').and.returnValue($q.resolve());
        spyOn(registration, 'processRegistrations');
        spyOn(modalMessage, 'error');
        spyOn(modalMessage, 'confirm');
        spyOn($location, 'path');

        scope = $rootScope.$new();
        $controller('cartCtrl', { $scope: scope });

        scope.$digest();
        cart.registrations = [
          {
            registration: mockRegistration,
            conference: mockConference,
            acceptedPaymentMethods: {
              acceptCreditCards: true,
              acceptTransfers: false,
              acceptScholarships: false,
              acceptChecks: false,
              acceptPayOnSite: false,
            },
          },
          {
            registration: mockRegistration2,
            conference: mockConference2,
            acceptedPaymentMethods: {
              acceptCreditCards: false,
              acceptTransfers: true,
              acceptScholarships: false,
              acceptChecks: false,
              acceptPayOnSite: false,
            },
          },
        ];
        $rootScope.$broadcast('cartUpdated');
      },
    ),
  );

  describe('loadCartRegistrations', () => {
    it('should set empty cart when no registrations in cart', () => {
      cart.registrations = [];
      $rootScope.$broadcast('cartUpdated');

      expect(scope.cartRegistrations).toEqual([]);
    });

    it('should calculate totals and payment', () => {
      expect(scope.cartRegistrations.length).toBe(2);
      expect(scope.cartRegistrations[0].registration.id).toBe(
        mockRegistration.id,
      );

      expect(scope.cartRegistrations[1].registration.id).toBe(
        mockRegistration2.id,
      );

      expect(scope.cartRegistrations[0].checked).toBe(true);
      expect(scope.cartRegistrations[0].disabled).toBe(false);
      expect(scope.cartRegistrations[1].checked).toBe(true);
      expect(scope.cartRegistrations[1].disabled).toBe(false);
      expect(scope.selectedCount).toBe(2);
      expect(scope.currentRegistration.remainingBalance).toBe(
        mockRegistration.remainingBalance + mockRegistration2.remainingBalance,
      );

      expect(scope.currentPayment.amount).toBe(
        mockRegistration.remainingBalance + mockRegistration2.remainingBalance,
      );

      expect(scope.currency).toBe(mockConference.currency.currencyCode);
      expect(scope.combinedAcceptedPaymentMethods).toEqual({
        acceptCreditCards: true,
        acceptTransfers: true,
        acceptScholarships: false,
      });
    });
  });

  describe('toggleRegistration', () => {
    it('should uncheck item and update totals', () => {
      const item = scope.cartRegistrations[0];

      expect(item.checked).toBe(true);
      expect(scope.selectedCount).toBe(2);
      expect(scope.currentPayment.amount).toBe(
        mockRegistration.remainingBalance + mockRegistration2.remainingBalance,
      );

      scope.toggleRegistration(item);

      expect(item.checked).toBe(false);
      expect(scope.selectedCount).toBe(1);
      expect(scope.currentRegistration.remainingBalance).toBe(
        mockRegistration2.remainingBalance,
      );

      expect(scope.currentPayment.amount).toBe(
        mockRegistration2.remainingBalance,
      );
    });

    it('should check item and update totals when toggled back', () => {
      const item = scope.cartRegistrations[0];
      scope.toggleRegistration(item);
      scope.toggleRegistration(item);

      expect(item.checked).toBe(true);
      expect(scope.selectedCount).toBe(2);
      expect(scope.currentRegistration.remainingBalance).toBe(
        mockRegistration.remainingBalance + mockRegistration2.remainingBalance,
      );

      expect(scope.currentPayment.amount).toBe(
        mockRegistration.remainingBalance + mockRegistration2.remainingBalance,
      );
    });
  });

  describe('removeFromCart', () => {
    beforeEach(() => {
      spyOn(cart, 'removeRegistration').and.callThrough();
    });

    it('should remove registration and update cart totals when confirmed', () => {
      modalMessage.confirm.and.returnValue($q.resolve());

      scope.removeFromCart(mockRegistration.id);
      scope.$digest();

      expect(modalMessage.confirm).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Remove from Cart',
        }),
      );

      expect(cart.removeRegistration).toHaveBeenCalledWith(mockRegistration.id);
      expect(
        scope.cartRegistrations.map((item) => item.registration.id),
      ).toEqual([mockRegistration2.id]);

      expect(scope.selectedCount).toBe(1);
      expect(scope.currentRegistration.remainingBalance).toBe(
        mockRegistration2.remainingBalance,
      );

      expect(scope.currentPayment.amount).toBe(
        mockRegistration2.remainingBalance,
      );
    });

    it('should not change cart when removal is cancelled', () => {
      modalMessage.confirm.and.returnValue($q.reject());

      scope.removeFromCart(mockRegistration.id);
      scope.$digest();

      expect(cart.removeRegistration).not.toHaveBeenCalled();
      expect(scope.cartRegistrations.length).toBe(2);
      expect(scope.selectedCount).toBe(2);

      expect(scope.currentPayment.amount).toBe(
        mockRegistration.remainingBalance + mockRegistration2.remainingBalance,
      );
    });
  });

  describe('addEvent', () => {
    it('should navigate to home page', () => {
      scope.addEvent();

      expect($location.path).toHaveBeenCalledWith('/');
    });
  });

  describe('submitRegistrations', () => {
    beforeEach(() => {
      scope.currentPayment = { paymentType: 'CREDIT_CARD' };
      spyOn(cart, 'removeRegistration');
    });

    it('should set submitting flag', () => {
      registration.processRegistrations.and.returnValue($q.resolve());

      scope.submitRegistrations();

      expect(scope.submittingRegistrations).toBe(true);
    });

    it('should process multiple registrations', () => {
      registration.processRegistrations.and.returnValue($q.resolve());

      scope.submitRegistrations();
      scope.$digest();

      expect(registration.processRegistrations).toHaveBeenCalledWith([
        {
          registration: mockRegistration,
          conference: mockConference,
          payment: {
            paymentType: 'CREDIT_CARD',
            amount: mockRegistration.remainingBalance,
          },
        },
        {
          registration: mockRegistration2,
          conference: mockConference2,
          payment: {
            paymentType: 'CREDIT_CARD',
            amount: mockRegistration2.remainingBalance,
          },
        },
      ]);

      expect(cart.removeRegistration).toHaveBeenCalledWith(mockRegistration.id);

      expect(cart.removeRegistration).toHaveBeenCalledWith(
        mockRegistration2.id,
      );

      expect(scope.submittingRegistrations).toBe(false);
    });

    it('should process only checked registrations', () => {
      registration.processRegistrations.and.returnValue($q.resolve());

      scope.toggleRegistration(scope.cartRegistrations[0]);
      scope.submitRegistrations();
      scope.$digest();

      expect(registration.processRegistrations).toHaveBeenCalledWith([
        {
          registration: mockRegistration2,
          conference: mockConference2,
          payment: {
            paymentType: 'CREDIT_CARD',
            amount: mockRegistration2.remainingBalance,
          },
        },
      ]);

      expect(scope.submittingRegistrations).toBe(false);

      expect(cart.removeRegistration).toHaveBeenCalledWith(
        mockRegistration2.id,
      );
    });

    it('should clear submitting flag on error', () => {
      registration.processRegistrations.and.returnValue($q.reject('error'));

      scope.submitRegistrations();
      scope.$digest();

      expect(scope.submittingRegistrations).toBe(false);
    });
  });

  describe('payment method selection', () => {
    it('should disable incompatible registrations and update totals', () => {
      scope.currentPayment.paymentType = 'CREDIT_CARD';
      scope.$digest();

      expect(scope.cartRegistrations[0].disabled).toBe(false);
      expect(scope.cartRegistrations[0].checked).toBe(true);
      expect(scope.cartRegistrations[1].disabled).toBe(true);
      expect(scope.cartRegistrations[1].checked).toBe(false);
      expect(scope.selectedCount).toBe(1);
      expect(scope.currentRegistration.remainingBalance).toBe(
        mockRegistration.remainingBalance,
      );

      expect(scope.currentPayment.amount).toBe(
        mockRegistration.remainingBalance,
      );
    });

    it('should enable different registrations', () => {
      scope.currentPayment.paymentType = 'CREDIT_CARD';
      scope.$digest();

      scope.currentPayment.paymentType = 'TRANSFER';
      scope.$digest();

      expect(scope.cartRegistrations[0].disabled).toBe(true);
      expect(scope.cartRegistrations[0].checked).toBe(false);
      expect(scope.cartRegistrations[1].disabled).toBe(false);
      expect(scope.cartRegistrations[1].checked).toBe(true);
      expect(scope.selectedCount).toBe(1);
      expect(scope.currentRegistration.remainingBalance).toBe(
        mockRegistration2.remainingBalance,
      );

      expect(scope.currentPayment.amount).toBe(
        mockRegistration2.remainingBalance,
      );
    });
  });
});
