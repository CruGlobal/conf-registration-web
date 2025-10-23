import angular from 'angular';
import { IHttpService, IQService, IPromise } from 'angular';

export interface MinistryActivity {
  id: string;
  name: string;
}

export interface MinistryStrategy {
  id: string;
  name: string;
}

export interface MinistryEventType {
  id: string;
  name: string;
}

export interface Ministry {
  id: string;
  name: string;
  activities: MinistryActivity[];
  strategies: MinistryStrategy[];
  eventTypes: MinistryEventType[];
}

export class MinistriesCache {
  private ministries: Ministry[] | null = null;

  /* @ngInject */
  constructor(private $http: IHttpService, private $q: IQService) {}

  /** Sort by name, with N/A at the bottom */
  private sortByName(a: { name: string }, b: { name: string }): number {
    if (a.name === 'N/A') {
      return 1;
    }
    if (b.name === 'N/A') {
      return -1;
    }

    return a.name.localeCompare(b.name);
  }

  get(): IPromise<Ministry[]> {
    if (this.ministries !== null) {
      return this.$q.resolve(this.ministries);
    }

    return this.$http.get<Ministry[]>('ministries').then((response) => {
      const ministries = response.data.sort(this.sortByName);
      ministries.forEach((ministry) => {
        ministry.activities.sort(this.sortByName);
        ministry.strategies.sort(this.sortByName);
        ministry.eventTypes.sort(this.sortByName);
      });

      this.ministries = ministries;
      return this.ministries;
    });
  }
}

angular
  .module('confRegistrationWebApp')
  .service('MinistriesCache', MinistriesCache);
