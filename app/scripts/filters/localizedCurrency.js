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
  .filter('localizedSymbol', ($locale, $window) => {
    return currencyCode => {
      let localeId = $locale && $locale.id ? $locale.id : 'en-us';
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
  // Some browsers incorrectly return nan or Nan for the formatToParts function
  // This will filter out all incorrect results.
  const filteredSymbol = numberFormat
    .formatToParts()
    .filter(e => e.type !== 'nan' || e.value !== 'NaN');

  if (filteredSymbol.length > 0) {
    return filteredSymbol.filter(e => e.type === 'currency')[0].value;
  }
}
