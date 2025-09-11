import angular, { IPromise, IQService } from 'angular';
import type { Conference } from 'conference';
import type { Registration } from 'registration';

export interface AcceptedPaymentMethods {
  acceptCreditCards: boolean;
  acceptTransfers: boolean;
  acceptScholarships: boolean;
  acceptChecks: boolean;
  acceptPayOnSite: boolean;
}

export interface CartRegistration {
  registration: Registration;
  conference: Conference;
  acceptedPaymentMethods: AcceptedPaymentMethods;
}

export class CartService {
  private static STORAGE_KEY = 'cartRegistrationIds';
  public registrations: CartRegistration[] = [];

  constructor(
    private $window: Window,
    private $rootScope: any,
    private $q: IQService,
    private RegistrationCache: any,
    private ConfCache: any,
    private payment: any,
  ) {
    this.loadRegistrations();
  }

  private readIds(): string[] {
    const ids = this.$window.localStorage.getItem(CartService.STORAGE_KEY);
    if (!ids) {
      return [];
    }
    return ids.split(',');
  }

  private saveIds(): void {
    this.$window.localStorage.setItem(
      CartService.STORAGE_KEY,
      this.registrations.map(({ registration }) => registration.id).join(','),
    );
  }

  private makeCartRegistration(
    registration: Registration,
    conference: Conference,
  ): CartRegistration {
    return {
      registration,
      conference,
      acceptedPaymentMethods: {
        ...this.payment.getAcceptedPaymentMethods(registration, conference),
        // Users may not pay by check because the check mailing address may be different
        // for different conferences
        acceptChecks: false,
        // Users may not pay on site
        acceptPayOnSite: false,
      },
    };
  }

  hasRegistration(id: string): boolean {
    return this.registrations.some(
      ({ registration }) => registration.id === id,
    );
  }

  addRegistration(registration: Registration, conference: Conference): void {
    if (!this.hasRegistration(registration.id)) {
      this.registrations.push(
        this.makeCartRegistration(registration, conference),
      );
      this.saveIds();
    }
  }

  removeRegistration(id: string): void {
    this.registrations = this.registrations.filter(
      ({ registration }) => registration.id !== id,
    );
    this.saveIds();
    this.$rootScope.$broadcast('cartUpdated');
  }

  loadRegistrations(): IPromise<CartRegistration[]> {
    const promises = this.readIds().map(
      (id): IPromise<CartRegistration> =>
        this.RegistrationCache.get(id)
          .then((registration: Registration) => {
            return this.ConfCache.get(registration.conferenceId).then(
              (conference: Conference) =>
                this.makeCartRegistration(registration, conference),
            );
          })
          // If any registrations or conferences can't be found, ignore them
          .catch(() => null),
    );

    return this.$q.all(promises).then((registrations) => {
      this.registrations = registrations.filter(
        (item) =>
          item &&
          Object.values(item.acceptedPaymentMethods).some(Boolean) &&
          !item.registration.completed &&
          item.registration.remainingBalance > 0,
      );
      this.$rootScope.$broadcast('cartUpdated');
      return this.registrations;
    });
  }
}

angular.module('confRegistrationWebApp').service('cart', CartService);
