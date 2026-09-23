import moment from 'moment';
import { showWtrSave50Promo } from './wtrSave50Promo';
import 'angular-mocks';

describe('showWtrSave50Promo', () => {
  let testData;
  let showPromo;

  beforeEach(angular.mock.module('confRegistrationWebApp'));

  beforeEach(
    angular.mock.inject(function (_testData_) {
      testData = _testData_;

      jasmine.clock().mockDate(moment('2026-09-01 12:00').toDate());

      // Family Life
      testData.conference.ministry = testData.ministries[3].id;
      // WTR
      testData.conference.ministryActivity =
        testData.ministries[3].activities[0].id;

      // registrantTypes[3] is the couple type, [4] is a spouse
      testData.conference.registrantTypes[3].name = 'Attendee';

      showPromo = () =>
        showWtrSave50Promo(testData.conference, testData.coupleRegistration);
    }),
  );

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('shows the promo for an Attendee couple registrant inside the window', () => {
    expect(showPromo()).toBe(true);
  });

  it('hides the promo before the window starts', () => {
    jasmine.clock().mockDate(moment('2026-08-30 12:00').toDate());

    expect(showPromo()).toBe(false);
  });

  it('hides the promo after the window ends', () => {
    jasmine.clock().mockDate(moment('2026-09-22 12:00').toDate());

    expect(showPromo()).toBe(false);
  });

  it('shows the promo on the first day of the window', () => {
    jasmine.clock().mockDate(moment('2026-08-31 12:00').toDate());

    expect(showPromo()).toBe(true);
  });

  it('shows the promo on the last day of the window', () => {
    jasmine.clock().mockDate(moment('2026-09-21 12:00').toDate());

    expect(showPromo()).toBe(true);
  });

  it('hides the promo for a couple type that is not named Attendee', () => {
    testData.conference.registrantTypes[3].name = 'Couple';

    expect(showPromo()).toBe(false);
  });

  it('hides the promo for an Attendee that is not a couple type', () => {
    testData.conference.registrantTypes[3].name = 'Couple';
    testData.conference.registrantTypes[4].name = 'Attendee';

    expect(showPromo()).toBe(false);
  });

  it('matches the registrant type name ignoring case and surrounding whitespace', () => {
    testData.conference.registrantTypes[3].name = '  attendee ';

    expect(showPromo()).toBe(true);
  });

  it('hides the promo when the ministry is not Family Life', () => {
    testData.conference.ministry = 'some-other-ministry-id';

    expect(showPromo()).toBe(false);
  });

  it('hides the promo when the ministry activity is not WTR', () => {
    testData.conference.ministryActivity = 'some-other-activity-id';

    expect(showPromo()).toBe(false);
  });

  it('hides the promo when the registration has no registrants', () => {
    testData.coupleRegistration.registrants = [];

    expect(showPromo()).toBe(false);
  });
});
