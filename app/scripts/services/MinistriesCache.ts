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

  get(): IPromise<Ministry[]> {
    if (this.ministries !== null) {
      return this.$q.resolve(this.ministries);
    }

    return this.$http.get<Ministry[]>('ministries').then((response) => {
      this.ministries = response.data;
      return this.ministries;
    });
  }
}

angular
  .module('confRegistrationWebApp')
  .service('MinistriesCache', MinistriesCache);
