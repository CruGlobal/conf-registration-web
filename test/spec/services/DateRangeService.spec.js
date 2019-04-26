import 'angular-mocks';

describe('Service: DateRangeService', function() {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var DateRangeService;
  beforeEach(inject(function(_DateRangeService_) {
    DateRangeService = _DateRangeService_;
  }));

  it('should call the callback when subscribed', function() {
    var object = {};
    object.callback = function() {};

    const callbackSpy = spyOn(object, 'callback').and.callThrough();

    DateRangeService.subscribe('sample-uuid', object.callback);
    DateRangeService.emitChange('sample-uuid', 'sample-date');

    expect(callbackSpy).toHaveBeenCalled();
  });
});
