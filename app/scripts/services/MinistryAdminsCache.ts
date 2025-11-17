import angular, { IHttpService, IPromise, IRootScopeService } from 'angular';
import { Ministry } from './MinistriesCache';
import { MinistriesCache } from './MinistriesCache';

export interface MinistryPermissions extends Ministry {
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
    private MinistriesCache: MinistriesCache,
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
      const permissionsPromise = this.$http
        .get<MinistryAdmin[]>('ministries/admin')
        .then((response) => response.data);

      this.loadPromise = this.$q
        .all([this.MinistriesCache.get(), permissionsPromise])
        .then(
          ([ministries, ministryPermissions]) => {
            this.ministries = this.processMinistries(
              ministries,
              ministryPermissions,
            );
            return this.ministries;
          },
          () => {
            this.loadPromise = null;
            this.ministries = [];
            return this.ministries;
          },
        );
      return this.loadPromise;
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

  private processMinistries(
    ministries: Ministry[],
    admins: MinistryAdmin[],
  ): MinistryPermissions[] {
    return ministries
      .map((ministry) => {
        const permissions = admins.find(
          (permission) => permission.ministry.id === ministry.id,
        );
        // Ignore ministries without ministry activities because admins won't be able to
        // create global promotions for them
        return permissions && ministry.activities.length > 0
          ? { ...ministry, readonly: permissions.permissionLevel === 'VIEW' }
          : null;
      })
      .filter((ministry) => ministry !== null);
  }
}

angular
  .module('confRegistrationWebApp')
  .service('MinistryAdminsCache', MinistryAdminsCache);
