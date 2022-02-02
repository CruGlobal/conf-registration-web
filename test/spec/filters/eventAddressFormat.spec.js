import 'angular-mocks';

describe('Filter: eventAddressFormat', () => {
  var filter;

  beforeEach(() => {
    angular.mock.module('confRegistrationWebApp');

    inject($injector => {
      filter = $injector.get('$filter')('eventAddressFormat');
    });
  });

  it('should format address | City, State Zip', () => {
    expect(filter('City', 'FL', '55555', 'US')).toEqual({
      addressLine3: 'City, FL 55555',
      addressCountry: 'United States',
    });
  });

  it('should format address | City, State', () => {
    expect(filter('City', 'FL', null, 'US')).toEqual({
      addressLine3: 'City, FL',
      addressCountry: 'United States',
    });
  });

  it('should format address | City, Zip', () => {
    expect(filter('City', null, '55555', 'US')).toEqual({
      addressLine3: 'City 55555',
      addressCountry: 'United States',
    });
  });

  it('should format address | Just City', () => {
    expect(filter('City', null, null, 'US')).toEqual({
      addressLine3: 'City',
      addressCountry: 'United States',
    });
  });

  it('should format address | State Zip', () => {
    expect(filter(null, 'FL', '55555', 'US')).toEqual({
      addressLine3: 'FL 55555',
      addressCountry: 'United States',
    });
  });

  it('should format address | Just State', () => {
    expect(filter(null, 'FL', null, 'US')).toEqual({
      addressLine3: 'FL',
      addressCountry: 'United States',
    });
  });

  it('should format address | Just Zip', () => {
    expect(filter(null, null, '55555', 'US')).toEqual({
      addressLine3: '55555',
      addressCountry: 'United States',
    });
  });

  it('should format address | No address', () => {
    expect(filter(null, null, null, 'US')).toEqual({
      addressLine3: '',
      addressCountry: 'United States',
    });
  });
});
