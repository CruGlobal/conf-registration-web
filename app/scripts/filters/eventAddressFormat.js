import { allCountries } from 'country-region-data';

angular
  .module('confRegistrationWebApp')
  .filter('eventAddressFormat', () => (city, state, zip, country) => {
    // Existing conferences will have a default country value of an empty string
    // To prevent issues, default their country to 'US' if country is falsey
    const currentCountry = country ? country : 'US';
    const filteredRegions = allCountries
      .find((c) => c[1] === currentCountry)[2]
      .filter((r) => r[1] === state);
    const formattedState =
      state && filteredRegions.length >= 1 ? filteredRegions[0][0] : state;

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

    const addressCountry = allCountries.find((c) => c[1] === currentCountry)[0];

    return {
      addressLine3,
      addressCountry,
    };
  });

export const getCurrentRegions = (country) =>
  allCountries.find((c) => c[1] === country)[2];
