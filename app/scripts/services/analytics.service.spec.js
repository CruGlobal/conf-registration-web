import angular from 'angular';
import 'angular-mocks';

describe('Service: analytics', () => {
  let analytics, $window, conference;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject((_analytics_, _$window_) => {
      analytics = _analytics_;
      $window = _$window_;
      $window.dataLayer = [];

      conference = {
        id: 'conference-1',
        name: 'Fall WTR 2026',
        abbreviation: 'WTR',
        currency: { currencyCode: 'USD' },
        registrantTypes: [
          { name: 'Standard', cost: 199, calculatedCurrentCost: 199 },
          { name: 'Pastor', cost: 199, calculatedCurrentCost: 174 },
          {
            name: 'Spouse',
            cost: 0,
            calculatedCurrentCost: 0,
            groupSubRegistrantType: true,
          },
          {
            name: 'Comp',
            cost: 0,
            calculatedCurrentCost: 0,
            hidden: true,
          },
        ],
      };
    }),
  );

  describe('trackEcommerce', () => {
    it('clears the previous ecommerce object before pushing the event', () => {
      analytics.trackEcommerce('some_event', { value: 1 });

      expect($window.dataLayer).toEqual([
        { ecommerce: null },
        { event: 'some_event', ecommerce: { value: 1 } },
      ]);
    });
  });

  describe('trackViewItem', () => {
    it('pushes view_item with the standard price when a type is named Standard', () => {
      analytics.trackViewItem(conference);

      expect($window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'view_item',
          ecommerce: {
            currency: 'USD',
            value: 199,
            items: [
              {
                item_id: 'conference-1',
                item_name: 'Fall WTR 2026',
                price: 199,
                item_category: 'WTR',
              },
            ],
          },
        },
      ]);
    });

    it('uses the WTR spouse price as the standard price', () => {
      conference.registrantTypes = [
        { name: 'Couple', defaultTypeKey: 'COUPLE', cost: 700 },
        { name: 'Spouse', defaultTypeKey: 'SPOUSE', cost: 350 },
        { name: 'Student', cost: 150 },
      ];
      analytics.trackViewItem(conference);

      expect($window.dataLayer[1].ecommerce.value).toBe(350);
    });

    it('uses the lowest price that is not $0 when there is no standard type', () => {
      conference.registrantTypes = [
        { name: 'Child', cost: 0 },
        { name: 'Intern', cost: 120 },
        { name: 'Student', cost: 99 },
      ];
      analytics.trackViewItem(conference);

      expect($window.dataLayer[1].ecommerce.value).toBe(99);
    });

    it('falls back to cost when calculatedCurrentCost is missing', () => {
      conference.registrantTypes = [{ name: 'Student', cost: 50 }];
      analytics.trackViewItem(conference);

      expect($window.dataLayer[1].ecommerce.value).toBe(50);
    });

    it('sends a price of 0 when every visible type is free', () => {
      conference.registrantTypes = [{ name: 'Guest', cost: 0 }];
      analytics.trackViewItem(conference);

      expect($window.dataLayer[1].ecommerce.value).toBe(0);
    });

    it('sends a price of 0 when no registrant types are visible', () => {
      conference.registrantTypes = [{ name: 'Comp', cost: 10, hidden: true }];
      analytics.trackViewItem(conference);

      expect($window.dataLayer[1].ecommerce.value).toBe(0);
      expect($window.dataLayer[1].ecommerce.items[0].price).toBe(0);
    });
  });

  describe('trackBeginCheckout', () => {
    let checkoutConference, registration;

    beforeEach(() => {
      $window.sessionStorage.clear();

      checkoutConference = {
        id: 'FL-12345',
        name: 'Fall WTR 2026',
        abbreviation: 'WTR',
        currency: { currencyCode: 'USD' },
        registrantTypes: [
          {
            id: 'type-pastor',
            name: 'Pastor',
            cost: 199,
            calculatedCurrentCost: 174,
          },
          { id: 'type-standard', name: 'Standard', cost: 50 },
        ],
      };
      registration = {
        id: 'registration-1',
        registrants: [
          { id: 'registrant-1', registrantTypeId: 'type-pastor' },
          { id: 'registrant-2', registrantTypeId: 'type-pastor' },
          { id: 'registrant-3', registrantTypeId: 'type-standard' },
        ],
      };
    });

    it('pushes begin_checkout with one item per registrant type and the total before discounts', () => {
      analytics.trackBeginCheckout(
        checkoutConference,
        registration,
        'registrant-1',
      );

      expect($window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'begin_checkout',
          ecommerce: {
            currency: 'USD',
            value: 398,
            items: [
              {
                item_id: 'FL-12345',
                item_name: 'Fall WTR 2026',
                item_variant: 'Pastor',
                price: 174,
                item_category: 'WTR',
                quantity: 2,
              },
              {
                item_id: 'FL-12345',
                item_name: 'Fall WTR 2026',
                item_variant: 'Standard',
                price: 50,
                item_category: 'WTR',
                quantity: 1,
              },
            ],
          },
        },
      ]);
    });

    it('only fires once for the same registrant', () => {
      analytics.trackBeginCheckout(
        checkoutConference,
        registration,
        'registrant-1',
      );
      analytics.trackBeginCheckout(
        checkoutConference,
        registration,
        'registrant-1',
      );

      expect(
        $window.dataLayer.filter((e) => e.event === 'begin_checkout').length,
      ).toBe(1);
    });

    it('does not fire again after a page refresh for a registrant already counted', () => {
      analytics.trackBeginCheckout(
        checkoutConference,
        registration,
        'registrant-1',
      );
      $window.dataLayer = [];

      // A refresh builds a fresh service, so only sessionStorage carries over.
      angular.mock.inject(($injector) => {
        const freshAnalytics = $injector.instantiate(analytics.constructor);
        freshAnalytics.trackBeginCheckout(
          checkoutConference,
          registration,
          'registrant-1',
        );
      });

      expect($window.dataLayer).toEqual([]);
    });

    it('fires again for a different registrant added to the same registration', () => {
      analytics.trackBeginCheckout(
        checkoutConference,
        registration,
        'registrant-1',
      );
      analytics.trackBeginCheckout(
        checkoutConference,
        registration,
        'registrant-3',
      );

      expect(
        $window.dataLayer.filter((e) => e.event === 'begin_checkout').length,
      ).toBe(2);
    });

    describe('on a registration that is already completed', () => {
      beforeEach(() => {
        registration.completed = true;
        registration.completedTimestamp = '2026-10-01T12:00:00.000Z';
        registration.registrants[0].createdTimestamp =
          '2026-10-01T11:59:00.000Z';
      });

      it('does not fire for a registrant who was already paid for and is only editing answers', () => {
        analytics.trackBeginCheckout(
          checkoutConference,
          registration,
          'registrant-1',
        );

        expect($window.dataLayer).toEqual([]);
      });

      it('fires for a registrant added after the registration was completed', () => {
        registration.registrants[2].createdTimestamp =
          '2026-11-03T09:00:00.000Z';
        analytics.trackBeginCheckout(
          checkoutConference,
          registration,
          'registrant-3',
        );

        expect(
          $window.dataLayer.filter((e) => e.event === 'begin_checkout').length,
        ).toBe(1);
      });

      it('fires for a registrant that has not been saved yet', () => {
        analytics.trackBeginCheckout(
          checkoutConference,
          registration,
          'registrant-3',
        );

        expect(
          $window.dataLayer.filter((e) => e.event === 'begin_checkout').length,
        ).toBe(1);
      });
    });
  });

  describe('when the GTM dataLayer has not been set up', () => {
    it('creates it instead of throwing', () => {
      delete $window.dataLayer;
      analytics.trackEcommerce('some_event', { value: 1 });

      expect($window.dataLayer).toEqual([
        { ecommerce: null },
        { event: 'some_event', ecommerce: { value: 1 } },
      ]);
    });
  });

  describe('trackAddPaymentInfo', () => {
    let paymentConference, registration;

    beforeEach(() => {
      $window.sessionStorage.clear();

      paymentConference = {
        id: 'FL-12345',
        name: 'Fall WTR 2026',
        abbreviation: 'WTR',
        currency: { currencyCode: 'USD' },
        registrantTypes: [
          {
            id: 'type-pastor',
            name: 'Pastor',
            cost: 199,
            calculatedCurrentCost: 174,
          },
        ],
      };
      registration = {
        id: 'registration-1',
        calculatedTotalDue: 313.2,
        promotions: [{ code: 'BOGO50' }],
        globalPromotions: [],
        registrants: [
          { id: 'registrant-1', registrantTypeId: 'type-pastor' },
          { id: 'registrant-2', registrantTypeId: 'type-pastor' },
        ],
      };
    });

    const paymentEvents = () =>
      $window.dataLayer.filter((e) => e.event === 'add_payment_info');

    it('pushes add_payment_info with the total, coupon, payment type and items', () => {
      analytics.trackAddPaymentInfo(
        paymentConference,
        registration,
        'CREDIT_CARD',
      );

      expect($window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'add_payment_info',
          ecommerce: {
            currency: 'USD',
            value: 313.2,
            coupon: 'BOGO50',
            payment_type: 'Credit Card',
            items: [
              {
                item_id: 'FL-12345',
                item_name: 'Fall WTR 2026',
                item_variant: 'Pastor',
                price: 174,
                item_category: 'WTR',
                quantity: 2,
              },
            ],
          },
        },
      ]);
    });

    it('calls a staff account transfer "Staff Account"', () => {
      analytics.trackAddPaymentInfo(
        paymentConference,
        registration,
        'TRANSFER',
      );

      expect(paymentEvents()[0].ecommerce.payment_type).toBe('Staff Account');
    });

    it('joins the codes when more than one promotion is applied', () => {
      registration.globalPromotions = [{ code: 'GLOBAL50' }];
      analytics.trackAddPaymentInfo(
        paymentConference,
        registration,
        'CREDIT_CARD',
      );

      expect(paymentEvents()[0].ecommerce.coupon).toBe('BOGO50,GLOBAL50');
    });

    it('leaves coupon out when no promotion is applied', () => {
      registration.promotions = [];
      analytics.trackAddPaymentInfo(
        paymentConference,
        registration,
        'CREDIT_CARD',
      );

      expect(paymentEvents()[0].ecommerce).not.toEqual(
        jasmine.objectContaining({ coupon: jasmine.anything() }),
      );
    });

    it('leaves payment_type out when no payment method is picked yet', () => {
      analytics.trackAddPaymentInfo(paymentConference, registration, undefined);

      expect(paymentEvents()[0].ecommerce).not.toEqual(
        jasmine.objectContaining({ payment_type: jasmine.anything() }),
      );
    });

    it('only fires once for the same registration', () => {
      analytics.trackAddPaymentInfo(
        paymentConference,
        registration,
        'CREDIT_CARD',
      );
      analytics.trackAddPaymentInfo(paymentConference, registration, 'CHECK');

      expect(paymentEvents().length).toBe(1);
    });
  });

  describe('trackPurchase', () => {
    let $rootScope, $timeout, $log, purchaseConference, registration;

    // Runs a digest and reports whether the promise has resolved yet.
    const isResolved = (promise) => {
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });
      $rootScope.$digest();
      return resolved;
    };

    beforeEach(
      angular.mock.inject((_$rootScope_, _$timeout_, _$log_) => {
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        $log = _$log_;
      }),
    );

    beforeEach(() => {
      purchaseConference = {
        id: 'FL-12345',
        name: 'Fall WTR 2026',
        abbreviation: 'WTR',
        currency: { currencyCode: 'USD' },
        registrantTypes: [
          {
            id: 'type-pastor',
            name: 'Pastor',
            cost: 199,
            calculatedCurrentCost: 174,
          },
        ],
      };
      registration = {
        id: 'registration-1',
        completed: false,
        calculatedTotalDue: 313.2,
        promotions: [{ code: 'FALL10' }],
        globalPromotions: [{ code: 'SAVE50' }],
        registrants: [
          { id: 'registrant-1', registrantTypeId: 'type-pastor' },
          { id: 'registrant-2', registrantTypeId: 'type-pastor' },
        ],
      };
    });

    it('pushes purchase with the registration id, final total, coupons and items', () => {
      analytics.trackPurchase(purchaseConference, registration);

      expect($window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'purchase',
          ecommerce: {
            transaction_id: 'registration-1',
            currency: 'USD',
            value: 313.2,
            tax: 0,
            coupon: 'FALL10,SAVE50',
            items: [
              {
                item_id: 'FL-12345',
                item_name: 'Fall WTR 2026',
                item_variant: 'Pastor',
                price: 174,
                item_category: 'WTR',
                quantity: 2,
              },
            ],
          },
          eventCallback: jasmine.any(Function),
        },
      ]);
    });

    it('leaves out coupon when no promo code was used', () => {
      registration.promotions = [];
      registration.globalPromotions = [];
      analytics.trackPurchase(purchaseConference, registration);

      expect('coupon' in $window.dataLayer[1].ecommerce).toBe(false);
    });

    it('resolves once GTM calls eventCallback', () => {
      const promise = analytics.trackPurchase(purchaseConference, registration);

      expect(isResolved(promise)).toBe(false);

      $window.dataLayer[1].eventCallback('GTM-TEST');

      expect(isResolved(promise)).toBe(true);
    });

    it('resolves after 1 second when GTM never calls back', () => {
      const promise = analytics.trackPurchase(purchaseConference, registration);

      $timeout.flush(999);

      expect(isResolved(promise)).toBe(false);

      $timeout.flush(1);

      expect(isResolved(promise)).toBe(true);
    });

    it('does not fire, and resolves right away, when the registration was already completed', () => {
      registration.completed = true;
      const promise = analytics.trackPurchase(purchaseConference, registration);

      expect(isResolved(promise)).toBe(true);
      expect($window.dataLayer).toEqual([]);
    });

    it('logs and resolves instead of throwing when the event cannot be built', () => {
      registration.registrants[0].registrantTypeId = 'type-deleted';
      let promise;

      expect(() => {
        promise = analytics.trackPurchase(purchaseConference, registration);
      }).not.toThrow();

      expect(isResolved(promise)).toBe(true);
      expect($window.dataLayer).toEqual([]);
      expect($log.error.logs.length).toBe(1);
    });
  });
});
