import angular, { IHttpService, IPromise, IRootScopeService } from 'angular';
import { Ministry } from './MinistriesCache';

interface MinistryPermissions {
  id: string;
  readonly: boolean;
}

interface MinistryAdmin {
  ministry: Pick<Ministry, 'id' | 'name'>;
  permissionLevel: 'VIEW' | 'UPDATE' | 'FULL' | 'CREATOR';
}

export class MinistryAdminsCache {
  private ministries: MinistryPermissions[] = [];
  private loadPromise: IPromise<MinistryPermissions[]> | null = null;

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

  private load(): IPromise<MinistryPermissions[]> {
    this.ministries = [];

    if (this.$cookies.get('crsToken')) {
      this.loadPromise = this.$http
        .get<MinistryAdmin[]>('ministries/admin')
        .then(
          (response) => {
            this.ministries = response.data.map(
              ({ ministry, permissionLevel }) => ({
                id: ministry.id,
                readonly: permissionLevel === 'VIEW',
              }),
            );
            return this.ministries;
          },
          () => {
            this.loadPromise = null;
            this.ministries = [];
            return this.ministries;
          },
        );
    } else {
      // Don't load if the user isn't logged in
      this.loadPromise = this.$q.resolve([]);
    }
    return this.loadPromise;
  }

  /**
   * Return the ministries that the current user is an admin of. If the ministries are still
   * loading, an empty array is returned.
   */
  getSync(): MinistryPermissions[] {
    return this.ministries;
  }

  /**
   * Return a promise resolving to the ministries that the current user is an admin of.
   */
  getAsync(): IPromise<MinistryPermissions[]> {
    return this.loadPromise ?? this.load();
  }
}

angular
  .module('confRegistrationWebApp')
  .service('MinistryAdminsCache', MinistryAdminsCache);
