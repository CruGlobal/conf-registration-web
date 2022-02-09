angular
  .module('confRegistrationWebApp')
  .service('logoutService', function ($location, $cookies, $window) {
    this.logoutFormProviders = ({ data = null } = {}) => {
      switch ($cookies.get('crsAuthProviderType')) {
        case 'GOOGLE':
          // if google, then logout from google using url generated on the backend
          if (data) {
            $window.location.href = data.googleUrl;
          }
          break;
        case 'FACEBOOK':
          // if facebook, then logout from facebook using url generated on the backend
          if (data) {
            $window.location.href = data.facebookUrl;
          }
          break;
        case 'RELAY': {
          // if relay, then redirect to the Okta logout URL
          if (data) {
            $window.location.href = data.oktaUrl;
          }
          break;
        }
      }
    };
  });
