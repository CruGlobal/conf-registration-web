import { filterCoupleSpouse } from '../utils/coupleTypeUtils';

angular.module('confRegistrationWebApp').filter('coupleSpouse', function () {
  return function (registrantTypes, conference) {
    if (!registrantTypes || !conference) {
      return registrantTypes;
    }
    return filterCoupleSpouse(registrantTypes, conference.registrantTypes);
  };
});
