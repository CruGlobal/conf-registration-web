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

angular
  .module('confRegistrationWebApp')
  .filter('localizedSymbol', ($locale) => {
    return (currencyCode) => {
      const localeId = $locale && $locale.id ? $locale.id : 'en-us';
      const numberFormat = new Intl.NumberFormat(localeId, {
        style: 'currency',
        currency: currencyCode || 'USD',
      });
      const currencySymbol = numberFormat
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value;
      return currencySymbol;
    };
  });
