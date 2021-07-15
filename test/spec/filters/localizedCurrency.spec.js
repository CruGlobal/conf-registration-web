import 'angular-mocks';

describe('Filter: localizedCurrency', function() {
  let filter;

  beforeEach(function() {
    angular.mock.module('confRegistrationWebApp');

    inject(function($injector) {
      filter = $injector.get('$filter')('localizedCurrency');
    });
  });

  it('should format currency amount', function() {
    var amount = 123.12;

    expect(filter(amount, 'USD')).toContain('123.12');
  });
});

describe('Filter: localizedSymbol', function() {
  let filter;

  beforeEach(function() {
    angular.mock.module('confRegistrationWebApp');

    inject(function($injector) {
      filter = $injector.get('$filter')('localizedSymbol');
    });
  });

  it('should format currency symbol', function() {
    expect(filter('USD')).toBe('$');
  });
});
