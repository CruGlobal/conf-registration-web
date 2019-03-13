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

  it('choices should be visible based on rules', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {id: '18ccfb09-3006-4981-ab5e-bbbbbbbbbbbb'});

    const choiceAAA = _.find(block.content.choices, {value: 'AAA'});
    const choiceBBB = _.find(block.content.choices, {value: 'BBB'});
    const choiceCCC = _.find(block.content.choices, {value: 'CCC'});
    const choiceDDD = _.find(block.content.choices, {value: 'DDD'});

    const registrant = angular.copy(testData.registration.registrants[0]);

    const answerIndex = _.findIndex(registrant.answers, {blockId: '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa'});
    registrant.answers[answerIndex].value = {
      A: true,
      B: true,
      C: false,
      D: true
    };

    // 'A' AND 'B' rules should show the option
    expect(validateRegistrant.choiceVisible(block, choiceAAA, registrant)).toBe(true);

    // 'C' OR 'D' rules should show the option
    expect(validateRegistrant.choiceVisible(block, choiceBBB, registrant)).toBe(true);

    // No rules should show the option
    expect(validateRegistrant.choiceVisible(block, choiceCCC, registrant)).toBe(true);

    // No operand for answers set (fallback for already created answers), default to OR
    // 'A' OR 'C' should show the option
    expect(validateRegistrant.choiceVisible(block, choiceDDD, registrant)).toBe(true);
  });

  it('choices should not be visible based on rules', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {id: '18ccfb09-3006-4981-ab5e-bbbbbbbbbbbb'});

    const choiceAAA = _.find(block.content.choices, {value: 'AAA'});
    const choiceBBB = _.find(block.content.choices, {value: 'BBB'});
    const choiceCCC = _.find(block.content.choices, {value: 'CCC'});
    const choiceDDD = _.find(block.content.choices, {value: 'DDD'});

    const registrant = angular.copy(testData.registration.registrants[0]);

    const answerIndex = _.findIndex(registrant.answers, {blockId: '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa'});
    registrant.answers[answerIndex].value = {
      A: false,
      B: true,
      C: false,
      D: false
    };

    // 'A' AND 'B' rules should not show the option
    expect(validateRegistrant.choiceVisible(block, choiceAAA, registrant)).toBe(false);

    // 'C' OR 'D' rules should not show the option
    expect(validateRegistrant.choiceVisible(block, choiceBBB, registrant)).toBe(false);

    // No rules should show the option
    expect(validateRegistrant.choiceVisible(block, choiceCCC, registrant)).toBe(true);

    // No operand for answers set (fallback for already created answers), default to OR
    // 'A' OR 'C' should not show the option
    expect(validateRegistrant.choiceVisible(block, choiceDDD, registrant)).toBe(false);
  });

  it('if any choice visible, block should be visible', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {id: '18ccfb09-3006-4981-ab5e-bbbbbbbbbbbb'});
    const registrant = angular.copy(testData.registration.registrants[0]);
    const answerIndex = _.findIndex(registrant.answers, {blockId: '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa'});
    registrant.answers[answerIndex].value = {
      A: true,
      B: true,
      C: true,
      D: true
    };

    // at least one choice is visible
    expect(validateRegistrant.blockVisible(block, registrant, false)).toBe(true);
  });

  it('no choices are visible, block should be hidden', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {id: '18ccfb09-3006-4981-ab5e-bbbbbbbbbbbb'});
    const registrant = angular.copy(testData.registration.registrants[0]);
    const answerIndex = _.findIndex(registrant.answers, {blockId: '18ccfb09-3006-4981-ab5e-aaaaaaaaaaaa'});
    registrant.answers[answerIndex].value = {
      A: false,
      B: false,
      C: false,
      D: false
    };

    // no choices are visible
    expect(validateRegistrant.blockVisible(block, registrant, false)).toBe(false);
  });

});
