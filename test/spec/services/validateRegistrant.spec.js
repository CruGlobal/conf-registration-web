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

  it('choice should be visible without rules', function () {
    const block = testData.conference.registrationPages[1].blocks[4];
    const choice = block.content.choices[0];

    expect(validateRegistrant.choiceVisible(block, choice, testData.registration.registrants[0])).toBe(true);
  });

  it('choice should be visible', function () {
    const block = testData.conference.registrationPages[1].blocks[4];
    const choice = block.content.choices[1];

    expect(validateRegistrant.choiceVisible(block, choice, testData.registration.registrants[0])).toBe(true);
  });

  it('choice should not be visible', function () {
    const block = testData.conference.registrationPages[1].blocks[5];
    const choice = block.content.choices[0];

    expect(validateRegistrant.choiceVisible(block, choice, testData.registration.registrants[0])).toBe(false);
  });

  it('empty checkbox should not be valid', function() {
    var conference = angular.copy(testData.conference);
    conference.registrationPages[1].blocks[5].required = true;

    var registrant = angular.copy(testData.registration.registrants[0]);
    registrant.answers[4].value = {'651': false, '951': false};

    expect(validateRegistrant.validate(conference, registrant).length).toBe(1);
  });

  it('empty address fields should not be valid when missing address1, state, zip or city', function() {
    var conference = angular.copy(testData.conference);
    conference.registrationPages[1].blocks[7].required = true;

    var registrant = angular.copy(testData.registration.registrants[0]);

    var registrantAddress1 = angular.copy(testData.registration.registrants[0]);
    registrantAddress1.answers[8].value = {'address1': ''};

    var registrantCity = angular.copy(testData.registration.registrants[0]);
    registrantCity.answers[8].value = {'city': ''};

    var registrantState = angular.copy(testData.registration.registrants[0]);
    registrantState.answers[8].value = {'state': ''};

    var registrantZip = angular.copy(testData.registration.registrants[0]);
    registrantZip.answers[8].value = {'zip': ''};

    expect(validateRegistrant.validate(conference, registrant).length).toBe(0);
    expect(validateRegistrant.validate(conference, registrantAddress1).length).toBe(1);
    expect(validateRegistrant.validate(conference, registrantCity).length).toBe(1);
    expect(validateRegistrant.validate(conference, registrantState).length).toBe(1);
    expect(validateRegistrant.validate(conference, registrantZip).length).toBe(1);
  });


});
