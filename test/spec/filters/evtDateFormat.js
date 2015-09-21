'use strict';

describe('Filter: evtDateFormat', function () {
  var filter;

  beforeEach(function(){
    module('confRegistrationWebApp');

    inject(function($injector){
      filter = $injector.get('$filter')('evtDateFormat');
    });
  });

  it('should should format date', function(){
    var date = new Date('December 17, 2014 03:24:00 GMT+0000');

    expect(filter(date)).toBe('Dec 17, 2014 3:24 am UTC');
  });
});