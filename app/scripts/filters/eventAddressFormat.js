import { allCountries } from 'country-region-data';

angular
  .module('confRegistrationWebApp')
  .filter('eventAddressFormat', () => (city, state, zip, country) => {
    const addressLine3 = city
      ? state
        ? zip
          ? `${city}, ${state} ${zip}`
          : `${city}, ${state}`
        : zip
        ? `${city} ${zip}`
        : `${city}`
      : state
      ? zip
        ? `${state} ${zip}`
        : `${state}`
      : zip
      ? `${zip}`
      : '';

    const addressCountry =
      allCountries[allCountries.map(c => c[1]).indexOf(country)][0];

    return {
      addressLine3,
      addressCountry,
    };
  });
