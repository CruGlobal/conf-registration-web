import 'angular-mocks';

describe('Filter: eventAddressFormat', () => {
  var filter;

  beforeEach(() => {
    angular.mock.module('confRegistrationWebApp');

    inject($injector => {
      filter = $injector.get('$filter')('eventAddressFormat');
    });
  });

  it('should format address', () => {
    expect(filter('City', 'FL', '55555', 'US')).toEqual({
      addressLine3: 'City, FL 55555',
      addressCountry: 'United States',
    });
  });
});
