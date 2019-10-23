angular
  .module('confRegistrationWebApp')
  .filter('localizedCurrency', function($locale) {
    return function(number, currencyCode) {
      return number.toLocaleString($locale.id, {
        style: 'currency',
        currency: currencyCode,
      });
      // return number.toLocaleString("en-AU", {style: 'currency', currency: currencyCode});
    };
  });

angular
  .module('confRegistrationWebApp')
  .filter('localizedSymbol', function($locale) {
    return function(currencyCode) {
      let localeId = $locale.id;
      let numberFormat = new Intl.NumberFormat(localeId, {
        style: 'currency',
        currency: currencyCode,
      });
      let symbol;
      if ('formatToParts' in numberFormat) {
        symbol = numberFormat
          .formatToParts()
          .filter(e => e.type === 'currency')[0].value;
      } else {
        let number = 0;
        symbol = number
          .toLocaleString(localeId, {
            style: 'currency',
            currency: currencyCode,
          })
          .replace(/[0., ]/g, '');
      }
      return symbol;
    };
  });
