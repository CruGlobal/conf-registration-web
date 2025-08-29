import angular from 'angular';

export class CartService {
  private static STORAGE_KEY = 'cartRegistrationIds';

  constructor(private $window: Window) {}

  private getIds(): string[] {
    const ids = this.$window.localStorage.getItem(CartService.STORAGE_KEY);
    if (!ids) {
      return [];
    }
    return ids.split(',').filter(Boolean);
  }

  private setIds(ids: string[]): void {
    this.$window.localStorage.setItem(CartService.STORAGE_KEY, ids.join(','));
  }

  getRegistrationIds(): string[] {
    return this.getIds();
  }

  hasRegistrationId(id: string): boolean {
    return this.getIds().includes(id);
  }

  addRegistrationId(id: string): void {
    const ids = this.getIds();
    if (!ids.includes(id)) {
      this.setIds([...ids, id]);
    }
  }
}

angular.module('confRegistrationWebApp').service('cart', CartService);
