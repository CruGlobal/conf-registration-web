const defaultCurrency = 'USD';

angular
  .module('confRegistrationWebApp')
  .filter('localizedCurrency', function ($locale) {
    return function (number, currencyCode) {
      if (number === null || number === undefined) {
        return '';
      }
      const localeId = $locale.id ? $locale.id : 'en-us';
      try {
        return number.toLocaleString(localeId, {
          style: 'currency',
          currency: currencyCode || defaultCurrency,
        });
      } catch {
        return number.toLocaleString(localeId, {
          style: 'currency',
          currency: defaultCurrency,
        });
      }
    };
  });
