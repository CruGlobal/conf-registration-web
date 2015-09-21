'use strict';

describe('Filter: tel', function () {
  var filter;

  beforeEach(function(){
    module('confRegistrationWebApp');

    inject(function($injector){
      filter = $injector.get('$filter')('tel');
    });
  });

  it('should should format date', function(){
    expect(filter('4075555555')).toBe('(407) 555-5555');
  });
});