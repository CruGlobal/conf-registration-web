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

  it('should handle null and undefined values by formatting as zero', function () {
    expect(filter(null, 'USD')).toContain('0');
    expect(filter(undefined, 'USD')).toContain('0');
  });
});

describe('Filter: localizedSymbol', function () {
  let filter;

  beforeEach(function () {
    angular.mock.module('confRegistrationWebApp');

    inject(function ($injector) {
      filter = $injector.get('$filter')('localizedSymbol');
    });
  });

  it('should format currency symbol', function () {
    expect(filter('USD')).toBe('$');
  });
});
