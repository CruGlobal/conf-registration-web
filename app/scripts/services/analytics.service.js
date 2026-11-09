import angular from 'angular';

// Readable payment_type values for GA4, matching the labels on the Review page.
const paymentTypeLabels = {
  CREDIT_CARD: 'Credit Card',
  CHECK: 'Check',
  TRANSFER: 'Staff Account',
  SCHOLARSHIP: 'Scholarship',
  FL_GIFT_CARD: 'Gift Card',
  PAY_ON_SITE: 'Pay on Site',
};

// Longest we hold the page after Confirm while GTM sends purchase. GTM usually answers much
// sooner. This only runs out when GTM is missing or blocked (ad blockers, localhost).
const PURCHASE_WAIT_MS = 1000;

class Analytics {
  constructor(
    $window,
    $location,
    $rootScope,
    $q,
    $timeout,
    $log,
    ProfileCache,
  ) {
    this.$window = $window;
    this.$location = $location;
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.$timeout = $timeout;
    this.$log = $log;
    this.ProfileCache = ProfileCache;

    this.digitalData = $window.digitalData;
  }

  firePageViewEvent() {
    // Profile info
    this.ProfileCache.getCache().then(
      (profile) => {
        this.digitalData.user[0].profile[0].profileInfo.loggedInStatus =
          'Logged In';
        switch (profile.authProviderType) {
          case 'RELAY':
            this.digitalData.user[0].profile[0].profileInfo.ssoGuid =
              profile.userAuthProviderId;
            break;
          case 'FACEBOOK':
            this.digitalData.user[0].profile[0].social.facebook =
              profile.userAuthProviderId;
            break;
        }
        // this.digitalData.user[0].profile[0].profileInfo.grMasterPersonId = ''; // TODO: provide when exposed by API
        this.track('virtual-page-view');
      },
      () => {
        this.digitalData.user[0].profile[0].profileInfo.loggedInStatus =
          'Logged Out';
        this.track('virtual-page-view');
      },
    );
  }

  track(event, data) {
    // Placing event data on digitalData layer for Google as requested by Clark but data could be pulled from the event instead
    Object.assign(this.digitalData, data);

    // Google Analytics
    this.$window.dataLayer.push(
      Object.assign(
        {},
        {
          event,
        },
        data,
      ),
    );
  }

  // GA4 ecommerce events. Clear the previous ecommerce object first so GTM doesn't merge stale fields into this event.
  // GTM calls the optional eventCallback once the tags for this event have run.
  trackEcommerce(event, ecommerce, eventCallback) {
    // If the GTM snippet hasn't run, don't let analytics break registration.
    this.$window.dataLayer = this.$window.dataLayer || [];
    this.$window.dataLayer.push({ ecommerce: null });
    this.$window.dataLayer.push({
      event,
      ecommerce,
      ...(eventCallback && { eventCallback }),
    });
  }

  // Fires once per registrant. sessionStorage keeps a refresh or the back button from counting them twice.
  trackBeginCheckout(conference, registration, registrantId) {
    // People who already paid can come back and edit answers. That's not a new checkout.
    // A registrant added after the registration was completed is new, so they still count.
    const registrant = registration.registrants.find(
      ({ id }) => id === registrantId,
    );
    if (
      registration.completed &&
      registrant?.createdTimestamp &&
      new Date(registrant.createdTimestamp) <=
        new Date(registration.completedTimestamp)
    ) {
      return;
    }

    if (!this.isFirstTime(`ga4BeginCheckout:${registrantId}`)) {
      return;
    }

    const items = this.buildCartItems(conference, registration);
    this.trackEcommerce('begin_checkout', {
      currency: conference.currency.currencyCode,
      value: items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      items,
    });
  }

  // Fires once per registration, the first time someone picks a payment method or clicks into a payment field.
  trackAddPaymentInfo(conference, registration, paymentType) {
    if (!this.isFirstTime(`ga4AddPaymentInfo:${registration.id}`)) {
      return;
    }

    const coupon = this.getCoupon(registration);

    this.trackEcommerce('add_payment_info', {
      currency: conference.currency.currencyCode,
      // calculatedTotalDue is the Total row on the Review page, after discounts.
      value: registration.calculatedTotalDue,
      ...(coupon && { coupon }),
      ...(paymentType && {
        payment_type: paymentTypeLabels[paymentType] || paymentType,
      }),
      items: this.buildCartItems(conference, registration),
    });
  }

  // Fires when a new registration is completed. Re-confirming one that was already completed isn't a new purchase.
  // Returns a promise that resolves once GTM has sent the event, so the caller can wait before a redirect
  // to another site cancels the request. It never rejects: the registration already went through,
  // so a tracking problem must not show the user an error.
  trackPurchase(conference, registration) {
    return this.$q((resolve) => {
      try {
        if (registration.completed) {
          resolve();
          return;
        }

        const coupon = this.getCoupon(registration);
        const ecommerce = {
          // GA4 drops a second purchase with the same transaction_id, so a reload can't count twice.
          transaction_id: registration.id,
          currency: conference.currency.currencyCode,
          // calculatedTotalDue is the Total row on the Review page, after discounts.
          value: registration.calculatedTotalDue,
          tax: 0,
          ...(coupon && { coupon }),
          items: this.buildCartItems(conference, registration),
        };

        this.$timeout(resolve, PURCHASE_WAIT_MS);
        // GTM calls back outside Angular, so $evalAsync runs a digest for whoever is waiting on this promise.
        this.trackEcommerce('purchase', ecommerce, () =>
          this.$rootScope.$evalAsync(resolve),
        );
      } catch (error) {
        this.$log.error('GA4 purchase tracking failed', error);
        resolve();
      }
    });
  }

  // All event and global promo codes on the registration, comma-separated. Empty string if none.
  getCoupon(registration) {
    return [
      ...(registration.promotions || []),
      ...(registration.globalPromotions || []),
    ]
      .map((promotion) => promotion.code)
      .join(',');
  }

  // True only the first time a key is seen in this browser tab. sessionStorage keeps a refresh
  // or the back button from counting someone twice.
  isFirstTime(storageKey) {
    try {
      if (this.$window.sessionStorage.getItem(storageKey)) {
        return false;
      }
      this.$window.sessionStorage.setItem(storageKey, 'true');
    } catch {
      // sessionStorage can be blocked (private mode). Sending a possible duplicate beats sending nothing.
    }
    return true;
  }

  // One item per registrant type, with quantity = how many registrants picked it.
  buildCartItems(conference, registration) {
    const itemsByType = {};
    registration.registrants.forEach(({ registrantTypeId }) => {
      if (itemsByType[registrantTypeId]) {
        itemsByType[registrantTypeId].quantity += 1;
        return;
      }
      const type = conference.registrantTypes.find(
        (registrantType) => registrantType.id === registrantTypeId,
      );
      itemsByType[registrantTypeId] = {
        item_id: conference.id,
        item_name: conference.name,
        item_variant: type.name,
        price: type.calculatedCurrentCost ?? type.cost,
        item_category: conference.abbreviation,
        quantity: 1,
      };
    });
    return Object.values(itemsByType);
  }

  // view_item fires before the user picks a ticket, so send one reference price for the event.
  // It's only for comparing views to purchases, so it doesn't need to be exact.
  trackViewItem(conference) {
    const paidTypes = conference.registrantTypes
      .filter((type) => !type.hidden && !type.groupSubRegistrantType)
      .map((type) => ({
        ...type,
        price: type.calculatedCurrentCost ?? type.cost,
      }))
      .filter((type) => type.price > 0);

    // 1. A clear standard price: the WTR spouse (per person) price, or a type named Standard or Regular.
    // 2. Otherwise the lowest price that isn't $0.
    const standardType =
      paidTypes.find((type) => type.defaultTypeKey === 'SPOUSE') ||
      paidTypes.find((type) => /\b(standard|regular)\b/i.test(type.name));
    let price = 0;
    if (standardType) {
      price = standardType.price;
    } else if (paidTypes.length) {
      price = Math.min(...paidTypes.map((type) => type.price));
    }

    this.trackEcommerce('view_item', {
      currency: conference.currency.currencyCode,
      value: price,
      items: [
        {
          item_id: conference.id,
          item_name: conference.name,
          price,
          item_category: conference.abbreviation,
        },
      ],
    });
  }
}

export default angular
  .module('confRegistrationWebApp')
  .service('analytics', Analytics).name;
