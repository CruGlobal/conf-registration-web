angular
  .module('confRegistrationWebApp')
  .filter('localizedCurrency', function($locale) {
    return function(number, currencyCode) {
      let localeId = $locale.id ? $locale.id : 'en-us';
      return number.toLocaleString(localeId, {
        style: 'currency',
        currency: currencyCode,
      });
    };
  });

angular
  .module('confRegistrationWebApp')
  .filter('localizedSymbol', function($locale, $window) {
    return function(currencyCode) {
      let localeId = $locale.id ? $locale.id : 'en-us';
      let symbol = symbolFromFormatToParts(localeId, currencyCode, $window);
      if (symbol) {
        return symbol;
      }
      let number = 0;
      return number
        .toLocaleString(localeId, {
          style: 'currency',
          currency: currencyCode,
        })
        .replace(/[0., ]/g, '');
    };
  });

function symbolFromFormatToParts(localeId, currencyCode, window) {
  if (!('Intl' in window)) {
    return;
  }
  let numberFormat = new Intl.NumberFormat(localeId, {
    style: 'currency',
    currency: currencyCode,
  });
  if (!('formatToParts' in numberFormat)) {
    return;
  }
  return numberFormat.formatToParts().filter(e => e.type === 'currency')[0]
    .value;
}
