import { allCountries } from 'country-region-data';

angular
  .module('confRegistrationWebApp')
  .filter('eventAddressFormat', () => (city, state, zip, country) => {
    const formattedState =
      state &&
      allCountries.reduce((result, currentCountry) => {
        if (currentCountry[1] === country) {
          result = currentCountry[2].filter(r => r[1] === state)[0][0];
        }
        return result;
      }, '');

    const addressLine3 = city
      ? state
        ? zip
          ? `${city}, ${formattedState} ${zip}`
          : `${city}, ${formattedState}`
        : zip
        ? `${city} ${zip}`
        : `${city}`
      : formattedState
      ? zip
        ? `${formattedState} ${zip}`
        : `${formattedState}`
      : zip
      ? `${zip}`
      : '';

    const addressCountry = country
      ? allCountries[allCountries.map(c => c[1]).indexOf(country)][0]
      : 'United States';

    return {
      addressLine3,
      addressCountry,
    };
  });

export const getCurrentRegions = country =>
  allCountries.find(c => c[1] === country)[2];
