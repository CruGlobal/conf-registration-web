import angular from 'angular';

class Analytics {
  constructor($window, $location, $rootScope, ProfileCache) {
    this.$window = $window;
    this.$location = $location;
    this.$rootScope = $rootScope;
    this.ProfileCache = ProfileCache;

    this.digitalData = $window.digitalData;
  }

  firePageViewEvent() {
    /* Adobe Analytics */
    // Profile info
    this.ProfileCache.getCache().then(
      profile => {
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
    // Placing event data on digitalData layer for Adobe and for Google as requested by Clark but data could be pulled from the event instead
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

    // Adobe Analytics
    this.$window._satellite &&
      this.$window._satellite.track(
        event === 'virtual-page-view' ? 'page view' : event,
      );
  }
}

export default angular
  .module('confRegistrationWebApp')
  .service('analytics', Analytics).name;
