angular
  .module('confRegistrationWebApp')
  .service(
    'staffLoginWarning',
    function staffLoginWarning($rootScope, gettextCatalog) {
      const providerNames = {
        GOOGLE: 'Google',
        FACEBOOK: 'Facebook',
        INSTAGRAM: 'Instagram',
      };

      // Lives on $rootScope so it stays up across route changes until the user dismisses it
      this.show = (authProviderType) => {
        const provider =
          providerNames[authProviderType] ||
          gettextCatalog.getString('a provider other than Okta');
        $rootScope.staffLoginWarning = gettextCatalog.getString(
          'You have logged in with {{provider}}. ERT only works properly for staff if they log in with Okta.',
          { provider },
        );
      };

      this.dismiss = () => {
        $rootScope.staffLoginWarning = '';
      };

      $rootScope.dismissStaffLoginWarning = this.dismiss;
    },
  );
