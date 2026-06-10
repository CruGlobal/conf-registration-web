import 'angular-mocks';

describe('Filter: localizedCurrency', function () {
  let filter;

  beforeEach(function () {
    angular.mock.module('confRegistrationWebApp');

    inject(function ($injector) {
      filter = $injector.get('$filter')('localizedCurrency');
    });
  });

  it('should format currency amount', function () {
    var amount = 123.12;

    expect(filter(amount, 'USD')).toContain('123.12');
  });

  it('should format zero amounts', function () {
    expect(filter(0, 'USD')).toContain('0.00');
  });

  it('should fall back to USD when currency code is missing', function () {
    expect(filter(123.12, undefined)).toContain('123.12');
    expect(filter(123.12, null)).toContain('123.12');
  });

  it('should fall back to USD when currency code is invalid', function () {
    expect(filter(123.12, 'BOGUS')).toContain('123.12');
  });

  it('should return an empty string when amount is missing', function () {
    expect(filter(undefined, 'USD')).toBe('');
    expect(filter(null, 'USD')).toBe('');
  });
});
