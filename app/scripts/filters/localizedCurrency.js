angular
  .module('confRegistrationWebApp')
  .filter('localizedCurrency', function ($locale) {
    return function (number, currencyCode) {
      if (number === null || number === undefined) {
        return '';
      }
      const localeId = $locale.id ? $locale.id : 'en-us';
      return number.toLocaleString(localeId, {
        style: 'currency',
        currency: currencyCode || 'USD',
      });
    };
  });
