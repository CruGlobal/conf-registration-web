angular
  .module('confRegistrationWebApp')
  .service(
    'staffLoginWarning',
    function staffLoginWarning(modalMessage, gettextCatalog) {
      const providerNames = {
        GOOGLE: 'Google',
        FACEBOOK: 'Facebook',
        INSTAGRAM: 'Instagram',
      };

      this.show = (authProviderType) => {
        const provider =
          providerNames[authProviderType] ||
          gettextCatalog.getString('a provider other than Okta');
        // forceAction makes them click OK, so the warning can't be dismissed without being seen
        modalMessage.error({
          title: gettextCatalog.getString('Please log in with Okta'),
          message: gettextCatalog.getString(
            'You have logged in with {{provider}}. ERT only works properly for staff if they log in with Okta.',
            { provider },
          ),
          forceAction: true,
        });
      };
    },
  );
