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
        this.adobeTrack('page view');
      },
      () => {
        this.digitalData.user[0].profile[0].profileInfo.loggedInStatus =
          'Logged Out';
        this.adobeTrack('page view');
      },
    );
  }

  track(event, data) {
    this.$window.dataLayer.push({
      event,
      ...data,
    });

    this.adobeTrack(event, data);
  }

  adobeTrack(event, data) {
    // Adobe Analytics below
    Object.assign(this.digitalData, data);
    this.$window._satellite && this.$window._satellite.track(event);
  }
}

export default angular
  .module('confRegistrationWebApp')
  .service('analytics', Analytics).name;
