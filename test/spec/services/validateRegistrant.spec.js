import 'angular-mocks';

describe('Service: validateRegistrant', function () {

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var validateRegistrant, testData;
  beforeEach(inject(function (_validateRegistrant_, _testData_) {
    validateRegistrant = _validateRegistrant_;
    testData = _testData_;
  }));

  it('block should be visible', function () {
    expect(validateRegistrant.blockVisible(testData.conference.registrationPages[1].blocks[0], testData.registration.registrants[0])).toBe(true);
  });

  it('registrant should have no invalid blocks', function () {
    expect(validateRegistrant.validate(testData.conference, testData.registration.registrants[0]).length).toBe(0);
  });

  it('registrant should have one invalid block', function () {
    //find name block
    var nameAnswer = _.find(testData.registration.registrants[0].answers, {blockId: '122a15bf-0608-4813-834a-0d31a8c44c64'});
    nameAnswer.value.lastName = '';

    expect(validateRegistrant.validate(testData.conference, testData.registration.registrants[0]).length).toBe(1);
  });
});
