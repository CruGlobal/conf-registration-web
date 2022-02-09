import 'angular-mocks';

describe('Filter: tel', function () {
  var filter;

  beforeEach(function () {
    angular.mock.module('confRegistrationWebApp');

    inject(function ($injector) {
      filter = $injector.get('$filter')('tel');
    });
  });

  it('should should format date', function () {
    expect(filter('4075555555')).toBe('(407) 555-5555');
  });
});
