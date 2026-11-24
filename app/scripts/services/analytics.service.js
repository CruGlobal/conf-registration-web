import angular from 'angular';

// Readable payment_type values for GA4. These are short forms of the payment method names on
// the Review page, not the page's exact wording.
const paymentTypeLabels = {
  CREDIT_CARD: 'Credit Card',
  CHECK: 'Check',
  TRANSFER: 'Staff Account',
  SCHOLARSHIP: 'Scholarship',
  FL_GIFT_CARD: 'Gift Card',
  PAY_ON_SITE: 'Pay on Site',
  // Confirm with no Payment section: a $0 total, or a ticket type with no payment options.
  NONE: 'None',
};

// Past payment rows that aren't money the attendee paid.
const nonPaymentTypes = ['REFUND', 'ADDITIONAL_EXPENSE'];

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

  // GA4 ecommerce events. Clear the previous ecommerce object first so GTM doesn't merge stale
  // fields into this event. GTM calls the optional eventCallback once the tags for this event
  // have run.
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

  // Tracking must never get in the way of registering. The GA4 calls run inside Register, Confirm
  // and form typing, so if building an event throws (say a ticket type was deleted), log it and
  // carry on. Returns what track returns, or undefined if it threw.
  safely(event, track) {
    try {
      return track();
    } catch (error) {
      this.$log.error(`GA4 ${event} tracking failed`, error);
      return undefined;
    }
  }

  // Fires on the Welcome page, once per tab for each event, so going back or reloading doesn't
  // add views. view_item fires before the user picks a ticket, so send one reference price for
  // the event. It's only for comparing views to purchases, so it doesn't need to be exact.
  trackViewItem(conference) {
    this.safely('view_item', () => {
      if (!this.isFirstTime(`ga4ViewItem:${conference.id}`)) {
        return;
      }

      const paidTypes = conference.registrantTypes
        .filter((type) => !type.hidden && !type.groupSubRegistrantType)
        .map((type) => ({
          ...type,
          price: this.getTicketPrice(type),
        }))
        .filter((type) => type.price > 0);

      // 1. A clear standard price: the WTR spouse (per person) price, or a type named
      //    Standard or Regular.
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
    });
  }

  // Fires once the Register click has saved the new person. A new registration counts once per tab,
  // so a couple or a group signing up together counts once. On a finished registration, each paid
  // person added counts as an add-on. A free person added sends nothing.
  trackAddToCart(conference, registration, registrantTypeId, registrantId) {
    this.safely('add_to_cart', () => {
      const type = this.getRegistrantType(conference, registrantTypeId);
      const price = this.getTicketPrice(type);
      const isAddOn = Boolean(registration.completed);
      if (isAddOn && !(price > 0)) {
        return;
      }
      if (
        !this.isFirstTime(
          `ga4AddToCart:${isAddOn ? registrantId : registration.id}`,
        )
      ) {
        return;
      }

      this.trackEcommerce('add_to_cart', {
        currency: conference.currency.currencyCode,
        value: price,
        registration_type: isAddOn ? 'add_on' : 'new',
        items: [
          {
            item_id: conference.id,
            item_name: conference.name,
            item_variant: type.name,
            price,
            item_category: conference.abbreviation,
            quantity: 1,
          },
        ],
      });
    });
  }

  // Fires on the first typing in a form, once per tab for each checkout (see getCheckouts).
  // On a new registration, typing for anyone on it counts. On a finished one, only typing for
  // a paid add-on counts, so people editing their answers send nothing.
  trackBeginCheckout(conference, registration, registrantId) {
    this.safely('begin_checkout', () => {
      // A new registration is one checkout. On a finished one, the only checkout this typing
      // can start is this person's, as an add-on.
      const checkoutId = registration.completed
        ? registrantId
        : registration.id;
      const storageKey = `ga4BeginCheckout:${checkoutId}`;
      // This runs on every keystroke, so check the flag before building any items.
      if (this.alreadyCounted(storageKey)) {
        return;
      }

      const checkout = this.getCheckouts(conference, registration).find(
        ({ id }) => id === checkoutId,
      );
      if (!checkout || !this.isFirstTime(storageKey)) {
        return;
      }

      this.trackEcommerce(
        'begin_checkout',
        this.checkoutEcommerce(conference, checkout),
      );
    });
  }

  // Fires the first time someone picks a payment method or clicks into a payment field, or on
  // Confirm when there's no Payment section. Once per tab for each checkout (see getCheckouts),
  // so paying a balance on a finished registration sends nothing.
  trackAddPaymentInfo(conference, registration, paymentType) {
    this.safely('add_payment_info', () => {
      this.getCheckouts(conference, registration).forEach((checkout) => {
        if (!this.isFirstTime(`ga4AddPaymentInfo:${checkout.id}`)) {
          return;
        }

        this.trackEcommerce('add_payment_info', {
          ...this.checkoutEcommerce(conference, checkout),
          ...(paymentType && {
            payment_type: paymentTypeLabels[paymentType] || paymentType,
          }),
        });
      });
    });
  }

  // Fires after Confirm saves the registration as finished, one purchase per checkout (see
  // getCheckouts). Pass the registration as it was before Confirm, so a new registration still
  // reads as new.
  // Returns a promise that resolves once GTM has sent every purchase, so the caller can wait
  // before a redirect to another site cancels the requests. It never rejects: the registration
  // already went through, so a tracking problem must not show the user an error.
  trackPurchase(conference, registration) {
    return (
      this.safely('purchase', () =>
        this.$q.all(
          this.getCheckouts(conference, registration).map((checkout) => {
            const sent = this.$q.defer();
            this.$timeout(() => sent.resolve(), PURCHASE_WAIT_MS);
            this.trackEcommerce(
              'purchase',
              {
                // GA4 drops a second purchase with the same transaction_id, so a reload
                // can't count twice.
                transaction_id: checkout.id,
                ...this.checkoutEcommerce(conference, checkout),
                tax: 0,
              },
              // GTM calls back outside Angular, so $evalAsync runs a digest for whoever is
              // waiting on this promise.
              () => this.$rootScope.$evalAsync(() => sent.resolve()),
            );
            return sent.promise;
          }),
        ),
      ) ?? this.$q.resolve()
    );
  }

  // The ecommerce fields every checkout step sends.
  checkoutEcommerce(conference, { value, coupon, registrationType, items }) {
    return {
      currency: conference.currency.currencyCode,
      value,
      ...(coupon && { coupon }),
      registration_type: registrationType,
      items,
    };
  }

  // What the checkout steps count. A new registration is one checkout with everyone on it, and
  // the total after discounts (the full total, even if they only pay a deposit). On a finished
  // registration, each paid person added later who hasn't been paid for yet is their own checkout,
  // with only their price. Nothing else on a finished registration counts.
  getCheckouts(conference, registration) {
    if (!registration.completed) {
      return [
        {
          id: registration.id,
          registrationType: 'new',
          // calculatedTotalDue is the Total row on the Review page, after discounts.
          value: registration.calculatedTotalDue,
          coupon: this.getCoupon(registration),
          items: registration.registrants.map((registrant) =>
            this.buildItem(conference, registration, registrant),
          ),
        },
      ];
    }

    return this.getUnpaidAddOns(registration).flatMap((registrant) => {
      const item = this.buildItem(conference, registration, registrant);
      if (item.price > 0) {
        return [
          {
            // GA4 needs a new transaction_id for each sale, and the registration's id was
            // already used.
            id: registrant.id,
            registrationType: 'add_on',
            value: item.price,
            coupon: item.coupon,
            items: [item],
          },
        ];
      }
      // A free person added later sends nothing.
      return [];
    });
  }

  // People added after the registration was finished, with no payment since they were added.
  // Confirm on a finished registration always takes a payment, so a payment made after
  // someone was added means they've been through checkout already.
  getUnpaidAddOns(registration) {
    const completedAt = new Date(registration.completedTimestamp);
    const payments = (registration.pastPayments || []).filter(
      ({ paymentType }) => !nonPaymentTypes.includes(paymentType),
    );

    return registration.registrants.filter((registrant) => {
      const addedAt = new Date(registrant.createdTimestamp);
      return (
        addedAt > completedAt &&
        !payments.some(
          ({ transactionDatetime }) => new Date(transactionDatetime) >= addedAt,
        )
      );
    });
  }

  // One GA4 item per person: their ticket type, what they cost after discounts, and the
  // discount and promo codes that got them there.
  buildItem(conference, registration, registrant) {
    const type = this.getRegistrantType(
      conference,
      registrant.registrantTypeId,
    );
    const discount =
      (registrant.calculatedEarlyRegistrationDiscounts || 0) +
      (registrant.calculatedPromotionDiscounts || 0);
    const coupon = registrant.calculatedPromotionDiscounts
      ? this.getCoupon(registration, registrant.registrantTypeId)
      : '';

    return {
      item_id: conference.id,
      item_name: conference.name,
      item_variant: type.name,
      // What this person costs after discounts, as shown on the Review page.
      // Falls back to the ticket price if the server hasn't worked it out yet.
      price: registrant.calculatedTotalDue ?? this.getTicketPrice(type),
      ...(discount > 0 && { discount }),
      ...(coupon && { coupon }),
      item_category: conference.abbreviation,
      quantity: 1,
    };
  }

  getRegistrantType(conference, registrantTypeId) {
    return conference.registrantTypes.find(({ id }) => id === registrantTypeId);
  }

  // A ticket type's price today, after any early bird discount. Falls back to its base cost if
  // the server hasn't worked that out.
  getTicketPrice(type) {
    return type.calculatedCurrentCost ?? type.cost;
  }

  // The event and global promo codes on the registration, comma-separated. Empty string if
  // none. With a ticket type, only the codes that can apply to it. Event codes can be limited
  // to some types.
  getCoupon(registration, registrantTypeId) {
    return [
      ...(registration.promotions || []),
      ...(registration.globalPromotions || []),
    ]
      .filter(
        ({ registrantTypeIds }) =>
          !registrantTypeId ||
          !registrantTypeIds?.length ||
          registrantTypeIds.includes(registrantTypeId),
      )
      .map((promotion) => promotion.code)
      .join(',');
  }

  // True if this key was already counted in this browser tab. sessionStorage keeps a refresh
  // or the back button from counting someone twice.
  alreadyCounted(storageKey) {
    try {
      return Boolean(this.$window.sessionStorage.getItem(storageKey));
    } catch {
      // sessionStorage can be blocked (private mode). Sending a possible duplicate beats
      // sending nothing.
      return false;
    }
  }

  // True only the first time a key is seen in this browser tab, and marks it as counted.
  isFirstTime(storageKey) {
    if (this.alreadyCounted(storageKey)) {
      return false;
    }
    try {
      this.$window.sessionStorage.setItem(storageKey, 'true');
    } catch {
      // Blocked sessionStorage, see alreadyCounted.
    }
    return true;
  }
}

export default angular
  .module('confRegistrationWebApp')
  .service('analytics', Analytics).name;
