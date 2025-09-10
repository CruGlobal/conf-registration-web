import angular from 'angular';
import 'angular-mocks';

describe('Controller: cartCtrl', () => {
  let scope,
    $rootScope,
    $controller,
    $location,
    $q,
    modalMessage,
    testData,
    mockConference,
    mockConference2,
    mockRegistration,
    mockRegistration2,
    cart,
    ConfCache,
    RegistrationCache,
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
        _testData_,
        _cart_,
        _ConfCache_,
        _RegistrationCache_,
        _registration_,
      ) => {
        $controller = _$controller_;
        $location = _$location_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        modalMessage = _modalMessage_;
        testData = _testData_;
        cart = _cart_;
        ConfCache = _ConfCache_;
        RegistrationCache = _RegistrationCache_;
        registration = _registration_;
        mockConference = angular.copy(testData.conference);
        mockRegistration = {
          ...angular.copy(testData.registration),
          completed: false,
          remainingBalance: 100,
        };
        mockConference2 = {
          ...angular.copy(testData.conference),
          id: 'conf2',
        };
        mockRegistration2 = {
          ...angular.copy(testData.registration),
          id: 'reg2',
          conferenceId: mockConference2.id,
          completed: false,
          remainingBalance: 150,
        };

        spyOn(cart, 'getRegistrationIds').and.returnValue([
          mockRegistration.id,
          mockRegistration2.id,
        ]);
        spyOn(ConfCache, 'get').and.callFake((id) =>
          $q.resolve(_.find([mockConference, mockConference2], { id })),
        );
        spyOn(RegistrationCache, 'get').and.callFake((id) =>
          $q.resolve(_.find([mockRegistration, mockRegistration2], { id })),
        );
        spyOn(registration, 'processRegistrations');
        spyOn(modalMessage, 'error');
        spyOn(modalMessage, 'confirm');
        spyOn($location, 'path');

        scope = $rootScope.$new();
        $controller('cartCtrl', { $scope: scope });
      },
    ),
  );

  describe('initialization', () => {
    it('should set default values', () => {
      expect(scope.cartRegistrations).toEqual([]);
      expect(scope.remainingBalanceTotal).toBe(0);
      expect(scope.submittingRegistrations).toBe(false);
      expect(scope.currentPayment).toEqual({});
    });
  });

  describe('loadCartRegistrations', () => {
    it('should set empty cart when no registrations in cart', () => {
      cart.getRegistrationIds.and.returnValue([]);

      scope = $rootScope.$new();
      $controller('cartCtrl', { $scope: scope });

      expect(scope.cartRegistrations).toEqual([]);
    });

    it('should calculate totals and payment', () => {
      scope.$digest();

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
      expect(scope.combinedAcceptedPaymentMethods).toBeDefined();
      expect(scope.combinedAcceptedPaymentMethods.acceptCreditCards).toBe(true);
    });

    it('should filter out completed registrations', () => {
      mockRegistration.completed = true;

      scope = $rootScope.$new();
      $controller('cartCtrl', { $scope: scope });
      scope.$digest();

      expect(
        scope.cartRegistrations.map((item) => item.registration.id),
      ).toEqual([mockRegistration2.id]);
    });

    it('should filter out registrations with no remaining balance', () => {
      mockRegistration.remainingBalance = 0;

      scope = $rootScope.$new();
      $controller('cartCtrl', { $scope: scope });
      scope.$digest();

      expect(
        scope.cartRegistrations.map((item) => item.registration.id),
      ).toEqual([mockRegistration2.id]);
    });

    it('should filter out registrations with no valid accepted payment methods', () => {
      mockConference.registrantTypes.forEach((registrantType) => {
        Object.assign(registrantType, {
          acceptChecks: true,
          acceptCreditCards: false,
          acceptTransfers: false,
          acceptPayOnSite: true,
          acceptScholarships: false,
        });
      });

      scope = $rootScope.$new();
      $controller('cartCtrl', { $scope: scope });
      scope.$digest();

      expect(
        scope.cartRegistrations.map((item) => item.registration.id),
      ).toEqual([mockRegistration2.id]);
    });

    it('should handle registration loading errors', () => {
      RegistrationCache.get.and.callFake((id) => {
        return id === mockRegistration.id
          ? $q.reject('error')
          : $q.resolve(mockRegistration2);
      });

      scope = $rootScope.$new();
      $controller('cartCtrl', { $scope: scope });
      scope.$digest();

      expect(scope.loading).toBe(false);
      expect(
        scope.cartRegistrations.map((item) => item.registration.id),
      ).toEqual([mockRegistration2.id]);
    });

    it('should handle conference loading errors', () => {
      ConfCache.get.and.callFake((id) => {
        return id === mockConference.id
          ? $q.reject('error')
          : $q.resolve(mockConference2);
      });

      scope = $rootScope.$new();
      $controller('cartCtrl', { $scope: scope });
      scope.$digest();

      expect(scope.loading).toBe(false);
      expect(
        scope.cartRegistrations.map((item) => item.registration.id),
      ).toEqual([mockRegistration2.id]);
    });
  });

  describe('toggleRegistration', () => {
    beforeEach(() => {
      scope.$digest();
    });

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
      spyOn(cart, 'removeRegistrationId');
      scope.$digest();
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

      expect(cart.removeRegistrationId).toHaveBeenCalledWith(
        mockRegistration.id,
      );

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

      expect(cart.removeRegistrationId).not.toHaveBeenCalled();
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
      scope.$digest();
      scope.currentPayment = { paymentType: 'CREDIT_CARD' };
      spyOn(cart, 'removeRegistrationId');
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

      expect(cart.removeRegistrationId).toHaveBeenCalledWith(
        mockRegistration.id,
      );

      expect(cart.removeRegistrationId).toHaveBeenCalledWith(
        mockRegistration2.id,
      );

      expect(scope.submittingRegistrations).toBe(false);
      expect(scope.cartRegistrations).toEqual([]);
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

      expect(cart.removeRegistrationId).toHaveBeenCalledWith(
        mockRegistration2.id,
      );

      expect(
        scope.cartRegistrations.map((item) => item.registration.id),
      ).toEqual([mockRegistration.id]);
    });

    it('should clear submitting flag on error', () => {
      registration.processRegistrations.and.returnValue($q.reject('error'));

      scope.submitRegistrations();
      scope.$digest();

      expect(scope.submittingRegistrations).toBe(false);
    });
  });

  describe('acceptedPaymentMethods', () => {
    it('should return combined accepted payment methods', () => {
      scope.combinedAcceptedPaymentMethods = {
        acceptCreditCards: true,
        acceptTransfers: false,
      };

      const result = scope.acceptedPaymentMethods();

      expect(result).toEqual({
        acceptCreditCards: true,
        acceptTransfers: false,
      });
    });
  });

  describe('payment method selection', () => {
    beforeEach(() => {
      mockConference.registrantTypes.forEach((registrantType) => {
        Object.assign(registrantType, {
          acceptCreditCards: true,
          acceptTransfers: false,
          acceptScholarships: false,
        });
      });

      mockConference2.registrantTypes.forEach((registrantType) => {
        Object.assign(registrantType, {
          acceptCreditCards: false,
          acceptTransfers: true,
          acceptScholarships: false,
        });
      });

      scope.$digest();
    });

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
