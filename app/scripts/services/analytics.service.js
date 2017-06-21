import angular from 'angular';

class Analytics {
  constructor($window, $location, $rootScope, ProfileCache) {
    this.$window = $window;
    this.$location = $location;
    this.$rootScope = $rootScope;
    this.ProfileCache = ProfileCache;

    this.digitalData = $window.digitalData;
  }

  firePageViewEvent(){
    /* Adobe Analytics */
    // Page title
    const pageTitle = this.$rootScope.globalPage ? this.$rootScope.globalPage.title : null;
    this.digitalData.page.pageInfo.pageName = 'Event Registration Tool | ' + (pageTitle || 'no PageName found');

    // Profile info
    this.digitalData.user[0].profile[0].profileInfo.loggedInStatus = 'Logged Out';
    this.ProfileCache.getCache(() => {
      this.digitalData.user[0].profile[0].profileInfo.loggedInStatus = 'Logged In';
      // TODO: Fill in profile info once exposed by API
      // this.digitalData.user[0].profile[0].profileInfo.ssoGuid = '';
      // this.digitalData.user[0].profile[0].profileInfo.grMasterPersonId = '';
      // this.digitalData.user[0].profile[0].social.facebook = '';
      this.track('page view');
    });

    /* Google Analytics*/
    if(this.$window.ga){
      this.$window.ga('send', 'pageview', {'page': this.$location.path()});
    }
  }

  track(event){
    this.$window._satellite && this.$window._satellite.track(event);
  }
}

export default angular
  .module('confRegistrationWebApp')
  .service('analytics', Analytics)
  .name;
