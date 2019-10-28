angular
  .module('confRegistrationWebApp')
  .service('logoutService', function(
    $location,
    $cookies,
    $window,
    $rootScope,
    $sce,
  ) {
    this.logoutFormProviders = ({ data = null } = {}) => {
      switch ($cookies.get('crsAuthProviderType')) {
        case 'FACEBOOK':
          // if facebook, then logout from facebook using url generated on the backend
          if (data) {
            $window.location.href = data.url;
          }
          break;
        case 'RELAY': {
          // if relay, then redirect to the Relay logout URL
          const serviceUrl = $location.absUrl().replace('logout', '');
          $window.location.href =
            'https://signon.cru.org/cas/logout?service=' + serviceUrl;
          break;
        }
        case 'INSTAGRAM':
          // if instagram, then logout from instagram on client side
          $rootScope.logoutElement = $sce.trustAsHtml(
            '<iframe class="logout-element" src="https://instagram.com/accounts/logout/" width="0" height="0" ' +
              "onload=\"document.querySelector('.logout-element').parentNode.removeChild(document.querySelector('.logout-element'));\"/>",
          );
      }
    };
  });
