import angular, { IHttpService, IPromise, IRootScopeService } from 'angular';

interface Ministry {
  id: string;
  name: string;
}

export class MinistryAdminsCache {
  private ministryIds: string[] = [];
  private loadPromise: IPromise<string[]> | null = null;

  /* @ngInject */
  constructor(
    private $cookies: angular.cookies.ICookiesService,
    private $http: IHttpService,
    private $q: angular.IQService,
    $rootScope: IRootScopeService,
  ) {
    // Reload the cache when the auth token changes because different users will have different
    // ministry admin access
    const unwatch = $rootScope.$watch(
      () => this.$cookies.get('crsToken'),
      () => {
        this.load();
      },
    );
    $rootScope.$on('$destroy', unwatch);
  }

  private load(): IPromise<string[]> {
    this.ministryIds = [];

    if (this.$cookies.get('crsToken')) {
      this.loadPromise = this.$http.get<Ministry[]>('ministries/admin').then(
        (response) => {
          this.ministryIds = response.data.map((ministry) => ministry.id);
          return this.ministryIds;
        },
        () => {
          this.loadPromise = null;
          this.ministryIds = [];
          return this.ministryIds;
        },
      );
    } else {
      // Don't load if the user isn't logged in
      this.loadPromise = this.$q.resolve([]);
    }
    return this.loadPromise;
  }

  /**
   * Return the ministry ids that the current user is an admin of. If the ministries are still
   * loading, an empty array is returned.
   */
  getSync(): string[] {
    return this.ministryIds;
  }

  /**
   * Return a promise resolving to the ministry ids that the current user is an admin of.
   */
  getAsync(): IPromise<string[]> {
    return this.loadPromise ?? this.load();
  }
}

angular
  .module('confRegistrationWebApp')
  .service('MinistryAdminsCache', MinistryAdminsCache);
