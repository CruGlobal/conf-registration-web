import 'angular-mocks';

describe('Filter: paymentTypeFormat', function () {
  let filter;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(inject(($filter) => {
    filter = $filter('paymentTypeFormat');
  }));

  it('should return empty string for undefined', function () {
    expect(filter(undefined)).toBe('');
  });

  it('should correctly format payment types', function () {
    expect(filter('FL_GIFT_CARD')).toBe('Fl gift card');
    expect(filter('CREDIT_CARD')).toBe('Credit card');
    expect(filter('CHECK')).toBe('Check');
    expect(filter('TRANSFER')).toBe('Transfer');
    expect(filter('SCHOLARSHIP')).toBe('Scholarship');
  });
});
