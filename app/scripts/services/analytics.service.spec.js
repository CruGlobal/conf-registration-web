import angular from 'angular';
import 'angular-mocks';

describe('Service: analytics', () => {
  let analytics, $window, conference, registration, paidAddOn, freeAddOn;

  // GA4 items for the people in the registration below.
  const pastorItem = {
    item_id: 'FL-12345',
    item_name: 'Fall WTR 2026',
    item_variant: 'Pastor',
    price: 154,
    discount: 45,
    coupon: 'FALL20',
    item_category: 'WTR',
    quantity: 1,
  };
  const addOnItem = {
    item_id: 'FL-12345',
    item_name: 'Fall WTR 2026',
    item_variant: 'Pastor',
    price: 174,
    discount: 25,
    item_category: 'WTR',
    quantity: 1,
  };

  // The GA4 events pushed with this name.
  const events = (name) =>
    $window.dataLayer.filter((entry) => entry.event === name);

  // The registration was finished on Oct 1 and paid in full that day.
  const finishRegistration = () => {
    registration.completed = true;
    registration.completedTimestamp = '2026-10-01T12:00:00.000Z';
    registration.pastPayments = [
      {
        paymentType: 'CREDIT_CARD',
        amount: 308,
        transactionDatetime: '2026-10-01T11:59:30.000Z',
      },
    ];
  };

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject((_analytics_, _$window_) => {
      analytics = _analytics_;
      $window = _$window_;
      $window.dataLayer = [];
      // The "already counted" flags live in sessionStorage, which outlives each test.
      $window.sessionStorage.clear();

      conference = {
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
          { id: 'type-student', name: 'Student', cost: 99 },
          {
            id: 'type-child',
            name: 'Child',
            cost: 0,
            calculatedCurrentCost: 0,
          },
        ],
      };
      // Two pastors: $199, minus $25 early bird and $20 from the FALL20 promo code.
      registration = {
        id: 'registration-1',
        completed: false,
        calculatedTotalDue: 308,
        promotions: [{ code: 'FALL20', registrantTypeIds: ['type-pastor'] }],
        globalPromotions: [],
        pastPayments: [],
        registrants: [
          {
            id: 'registrant-1',
            registrantTypeId: 'type-pastor',
            calculatedTotalDue: 154,
            calculatedEarlyRegistrationDiscounts: 25,
            calculatedPromotionDiscounts: 20,
            createdTimestamp: '2026-10-01T11:50:00.000Z',
          },
          {
            id: 'registrant-2',
            registrantTypeId: 'type-pastor',
            calculatedTotalDue: 154,
            calculatedEarlyRegistrationDiscounts: 25,
            calculatedPromotionDiscounts: 20,
            createdTimestamp: '2026-10-01T11:55:00.000Z',
          },
        ],
      };
      // People added after the registration was finished.
      paidAddOn = {
        id: 'registrant-3',
        registrantTypeId: 'type-pastor',
        calculatedTotalDue: 174,
        calculatedEarlyRegistrationDiscounts: 25,
        calculatedPromotionDiscounts: 0,
        createdTimestamp: '2026-11-03T09:00:00.000Z',
      };
      freeAddOn = {
        id: 'registrant-4',
        registrantTypeId: 'type-child',
        calculatedTotalDue: 0,
        calculatedEarlyRegistrationDiscounts: 0,
        calculatedPromotionDiscounts: 0,
        createdTimestamp: '2026-11-03T09:05:00.000Z',
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

    it('creates the GTM dataLayer if it has not been set up', () => {
      delete $window.dataLayer;
      analytics.trackEcommerce('some_event', { value: 1 });

      expect($window.dataLayer).toEqual([
        { ecommerce: null },
        { event: 'some_event', ecommerce: { value: 1 } },
      ]);
    });
  });

  // These run inside Register, Confirm and form typing, so a tracking error must not stop the
  // user.
  describe('when an event cannot be built', () => {
    let $log;

    beforeEach(
      angular.mock.inject((_$log_) => {
        $log = _$log_;
        // A ticket type that was deleted, so building the item throws.
        registration.registrants[0].registrantTypeId = 'type-deleted';
      }),
    );

    it('logs instead of throwing for add_to_cart, so Register still goes through', () => {
      expect(() =>
        analytics.trackAddToCart(
          conference,
          registration,
          'type-deleted',
          'registrant-1',
        ),
      ).not.toThrow();

      expect($window.dataLayer).toEqual([]);
      expect($log.error.logs[0][0]).toBe('GA4 add_to_cart tracking failed');
    });

    it('logs instead of throwing for begin_checkout', () => {
      expect(() =>
        analytics.trackBeginCheckout(conference, registration, 'registrant-1'),
      ).not.toThrow();

      expect($window.dataLayer).toEqual([]);
      expect($log.error.logs[0][0]).toBe('GA4 begin_checkout tracking failed');
    });

    it('logs instead of throwing for add_payment_info, so Confirm still goes through', () => {
      expect(() =>
        analytics.trackAddPaymentInfo(conference, registration, 'NONE'),
      ).not.toThrow();

      expect($window.dataLayer).toEqual([]);
      expect($log.error.logs[0][0]).toBe(
        'GA4 add_payment_info tracking failed',
      );
    });

    it('logs instead of throwing for view_item', () => {
      conference.currency = null;

      expect(() => analytics.trackViewItem(conference)).not.toThrow();

      expect($window.dataLayer).toEqual([]);
      expect($log.error.logs[0][0]).toBe('GA4 view_item tracking failed');
    });
  });

  describe('trackViewItem', () => {
    beforeEach(() => {
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
    });

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

    it('only fires once per tab for the same event', () => {
      analytics.trackViewItem(conference);
      analytics.trackViewItem(conference);

      expect(events('view_item').length).toBe(1);
    });

    it('fires again for a different event', () => {
      analytics.trackViewItem(conference);
      analytics.trackViewItem({ ...conference, id: 'conference-2' });

      expect(events('view_item').length).toBe(2);
    });
  });

  describe('trackAddToCart', () => {
    it('pushes add_to_cart with the ticket price for a new registration', () => {
      analytics.trackAddToCart(
        conference,
        registration,
        'type-pastor',
        'registrant-1',
      );

      expect($window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'add_to_cart',
          ecommerce: {
            currency: 'USD',
            value: 174,
            registration_type: 'new',
            items: [
              {
                item_id: 'FL-12345',
                item_name: 'Fall WTR 2026',
                item_variant: 'Pastor',
                price: 174,
                item_category: 'WTR',
                quantity: 1,
              },
            ],
          },
        },
      ]);
    });

    it('only fires once per registration, even when a group signs up together', () => {
      analytics.trackAddToCart(
        conference,
        registration,
        'type-pastor',
        'registrant-1',
      );
      analytics.trackAddToCart(
        conference,
        registration,
        'type-pastor',
        'registrant-2',
      );

      expect(events('add_to_cart').length).toBe(1);
    });

    describe('on a finished registration', () => {
      beforeEach(finishRegistration);

      it('fires for each paid person added, as an add-on', () => {
        analytics.trackAddToCart(
          conference,
          registration,
          'type-pastor',
          'registrant-3',
        );
        analytics.trackAddToCart(
          conference,
          registration,
          'type-pastor',
          'registrant-5',
        );

        expect(
          events('add_to_cart').map(
            ({ ecommerce }) => ecommerce.registration_type,
          ),
        ).toEqual(['add_on', 'add_on']);
      });

      it('does not fire for a free person added', () => {
        analytics.trackAddToCart(
          conference,
          registration,
          'type-child',
          'registrant-4',
        );

        expect($window.dataLayer).toEqual([]);
      });
    });
  });

  describe('trackBeginCheckout', () => {
    it('pushes begin_checkout with the total after discounts, coupon and one item per person', () => {
      analytics.trackBeginCheckout(conference, registration, 'registrant-1');

      expect($window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'begin_checkout',
          ecommerce: {
            currency: 'USD',
            value: 308,
            coupon: 'FALL20',
            registration_type: 'new',
            items: [pastorItem, pastorItem],
          },
        },
      ]);
    });

    it('leaves discount and coupon off a person who got no discount', () => {
      registration.registrants[1] = { ...freeAddOn, id: 'registrant-2' };
      analytics.trackBeginCheckout(conference, registration, 'registrant-1');

      expect(events('begin_checkout')[0].ecommerce.items[1]).toEqual({
        item_id: 'FL-12345',
        item_name: 'Fall WTR 2026',
        item_variant: 'Child',
        price: 0,
        item_category: 'WTR',
        quantity: 1,
      });
    });

    it("only lists the promo codes that can apply to a person's ticket type", () => {
      registration.globalPromotions = [{ code: 'GLOBAL5' }];
      registration.registrants[1] = {
        id: 'registrant-2',
        registrantTypeId: 'type-student',
        calculatedTotalDue: 94,
        calculatedPromotionDiscounts: 5,
      };
      analytics.trackBeginCheckout(conference, registration, 'registrant-1');
      const { ecommerce } = events('begin_checkout')[0];

      expect(ecommerce.coupon).toBe('FALL20,GLOBAL5');
      expect(ecommerce.items[0].coupon).toBe('FALL20,GLOBAL5');
      expect(ecommerce.items[1].coupon).toBe('GLOBAL5');
    });

    it('falls back to the ticket price when the server has not worked out a person total yet', () => {
      delete registration.registrants[1].calculatedTotalDue;
      analytics.trackBeginCheckout(conference, registration, 'registrant-1');

      expect(events('begin_checkout')[0].ecommerce.items[1].price).toBe(174);
    });

    it('only fires once per registration, even when a group signs up together', () => {
      analytics.trackBeginCheckout(conference, registration, 'registrant-1');
      analytics.trackBeginCheckout(conference, registration, 'registrant-2');

      expect(events('begin_checkout').length).toBe(1);
    });

    it('does not fire again after a page refresh', () => {
      analytics.trackBeginCheckout(conference, registration, 'registrant-1');
      $window.dataLayer = [];

      // A refresh builds a fresh service, so only sessionStorage carries over.
      angular.mock.inject(($injector) => {
        const freshAnalytics = $injector.instantiate(analytics.constructor);
        freshAnalytics.trackBeginCheckout(
          conference,
          registration,
          'registrant-1',
        );
      });

      expect($window.dataLayer).toEqual([]);
    });

    it('checks the "already counted" flag before building the items, since it runs on every keystroke', () => {
      spyOn(analytics, 'getCheckouts').and.callThrough();
      analytics.trackBeginCheckout(conference, registration, 'registrant-1');
      analytics.trackBeginCheckout(conference, registration, 'registrant-1');

      expect(analytics.getCheckouts).toHaveBeenCalledTimes(1);
    });

    describe('on a finished registration', () => {
      beforeEach(() => {
        finishRegistration();
        registration.registrants.push(paidAddOn, freeAddOn);
      });

      it('does not fire when someone who was already registered edits their answers', () => {
        analytics.trackBeginCheckout(conference, registration, 'registrant-1');

        expect($window.dataLayer).toEqual([]);
      });

      it('fires for a paid person added later, with only their price and ticket', () => {
        analytics.trackBeginCheckout(conference, registration, 'registrant-3');

        expect($window.dataLayer).toEqual([
          { ecommerce: null },
          {
            event: 'begin_checkout',
            ecommerce: {
              currency: 'USD',
              value: 174,
              registration_type: 'add_on',
              items: [addOnItem],
            },
          },
        ]);
      });

      it('does not fire for a free person added later', () => {
        analytics.trackBeginCheckout(conference, registration, 'registrant-4');

        expect($window.dataLayer).toEqual([]);
      });

      it('does not fire for a person added later who was already paid for', () => {
        registration.pastPayments.push({
          paymentType: 'CHECK',
          amount: 174,
          transactionDatetime: '2026-11-03T09:30:00.000Z',
        });
        analytics.trackBeginCheckout(conference, registration, 'registrant-3');

        expect($window.dataLayer).toEqual([]);
      });

      it('does not treat a refund after they were added as paying for them', () => {
        registration.pastPayments.push({
          paymentType: 'REFUND',
          amount: 20,
          transactionDatetime: '2026-11-03T09:30:00.000Z',
        });
        analytics.trackBeginCheckout(conference, registration, 'registrant-3');

        expect(events('begin_checkout').length).toBe(1);
      });
    });
  });

  describe('trackAddPaymentInfo', () => {
    it('pushes add_payment_info with the total, coupon, payment type and items', () => {
      analytics.trackAddPaymentInfo(conference, registration, 'CREDIT_CARD');

      expect($window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'add_payment_info',
          ecommerce: {
            currency: 'USD',
            value: 308,
            coupon: 'FALL20',
            registration_type: 'new',
            payment_type: 'Credit Card',
            items: [pastorItem, pastorItem],
          },
        },
      ]);
    });

    it('calls a staff account transfer "Staff Account"', () => {
      analytics.trackAddPaymentInfo(conference, registration, 'TRANSFER');

      expect(events('add_payment_info')[0].ecommerce.payment_type).toBe(
        'Staff Account',
      );
    });

    it('calls Confirm with no Payment section "None"', () => {
      analytics.trackAddPaymentInfo(conference, registration, 'NONE');

      expect(events('add_payment_info')[0].ecommerce.payment_type).toBe('None');
    });

    it('joins the codes when more than one promotion is applied', () => {
      registration.globalPromotions = [{ code: 'GLOBAL50' }];
      analytics.trackAddPaymentInfo(conference, registration, 'CREDIT_CARD');

      expect(events('add_payment_info')[0].ecommerce.coupon).toBe(
        'FALL20,GLOBAL50',
      );
    });

    it('leaves coupon out when no promotion is applied', () => {
      registration.promotions = [];
      analytics.trackAddPaymentInfo(conference, registration, 'CREDIT_CARD');

      expect(events('add_payment_info')[0].ecommerce).not.toEqual(
        jasmine.objectContaining({ coupon: jasmine.anything() }),
      );
    });

    it('leaves payment_type out when no payment method is picked yet', () => {
      analytics.trackAddPaymentInfo(conference, registration, undefined);

      expect(events('add_payment_info')[0].ecommerce).not.toEqual(
        jasmine.objectContaining({ payment_type: jasmine.anything() }),
      );
    });

    it('only fires once for the same registration', () => {
      analytics.trackAddPaymentInfo(conference, registration, 'CREDIT_CARD');
      analytics.trackAddPaymentInfo(conference, registration, 'CHECK');

      expect(events('add_payment_info').length).toBe(1);
    });

    describe('on a finished registration', () => {
      beforeEach(finishRegistration);

      it('does not fire when paying a balance', () => {
        analytics.trackAddPaymentInfo(conference, registration, 'CREDIT_CARD');

        expect($window.dataLayer).toEqual([]);
      });

      it('fires once for each paid person added later, with only their price', () => {
        registration.registrants.push(paidAddOn, freeAddOn, {
          ...paidAddOn,
          id: 'registrant-5',
        });
        analytics.trackAddPaymentInfo(conference, registration, 'CHECK');
        analytics.trackAddPaymentInfo(conference, registration, 'CHECK');
        const addOnPaymentInfo = {
          currency: 'USD',
          value: 174,
          registration_type: 'add_on',
          payment_type: 'Check',
          items: [addOnItem],
        };

        expect(
          events('add_payment_info').map(({ ecommerce }) => ecommerce),
        ).toEqual([addOnPaymentInfo, addOnPaymentInfo]);
      });
    });
  });

  describe('trackPurchase', () => {
    let $rootScope, $timeout, $log;

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

    it('pushes purchase with the registration id, final total, coupon and items', () => {
      analytics.trackPurchase(conference, registration);

      expect($window.dataLayer).toEqual([
        { ecommerce: null },
        {
          event: 'purchase',
          ecommerce: {
            transaction_id: 'registration-1',
            currency: 'USD',
            value: 308,
            coupon: 'FALL20',
            registration_type: 'new',
            tax: 0,
            items: [pastorItem, pastorItem],
          },
          eventCallback: jasmine.any(Function),
        },
      ]);
    });

    it('leaves out coupon when no promo code was used', () => {
      registration.promotions = [];
      analytics.trackPurchase(conference, registration);

      expect('coupon' in $window.dataLayer[1].ecommerce).toBe(false);
    });

    it('resolves once GTM calls eventCallback', () => {
      const promise = analytics.trackPurchase(conference, registration);

      expect(isResolved(promise)).toBe(false);

      $window.dataLayer[1].eventCallback('GTM-TEST');

      expect(isResolved(promise)).toBe(true);
    });

    it('resolves after 1 second when GTM never calls back', () => {
      const promise = analytics.trackPurchase(conference, registration);

      $timeout.flush(999);

      expect(isResolved(promise)).toBe(false);

      $timeout.flush(1);

      expect(isResolved(promise)).toBe(true);
    });

    it('logs and resolves instead of throwing when the event cannot be built', () => {
      registration.registrants[0].registrantTypeId = 'type-deleted';
      let promise;

      expect(() => {
        promise = analytics.trackPurchase(conference, registration);
      }).not.toThrow();

      expect(isResolved(promise)).toBe(true);
      expect($window.dataLayer).toEqual([]);
      expect($log.error.logs.length).toBe(1);
    });

    describe('on a finished registration', () => {
      beforeEach(finishRegistration);

      it('does not fire, and resolves right away, when paying a balance', () => {
        const promise = analytics.trackPurchase(conference, registration);

        expect(isResolved(promise)).toBe(true);
        expect($window.dataLayer).toEqual([]);
      });

      it("sends a purchase for a paid person added later, with that person's id and price", () => {
        registration.registrants.push(paidAddOn, freeAddOn);
        analytics.trackPurchase(conference, registration);

        expect(events('purchase').map(({ ecommerce }) => ecommerce)).toEqual([
          {
            transaction_id: 'registrant-3',
            currency: 'USD',
            value: 174,
            registration_type: 'add_on',
            tax: 0,
            items: [addOnItem],
          },
        ]);
      });

      it('waits for every purchase to be sent when two people were added', () => {
        registration.registrants.push(paidAddOn, {
          ...paidAddOn,
          id: 'registrant-5',
        });
        const promise = analytics.trackPurchase(conference, registration);
        const [first, second] = events('purchase');

        first.eventCallback('GTM-TEST');

        expect(isResolved(promise)).toBe(false);

        second.eventCallback('GTM-TEST');

        expect(isResolved(promise)).toBe(true);
      });
    });
  });
});
