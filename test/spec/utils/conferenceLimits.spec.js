import 'angular-mocks';
import * as conferenceLimits from '../../../app/scripts/utils/conferenceLimits';

describe('conferenceLimits', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  let conference;
  beforeEach(
    angular.mock.inject((testData) => {
      conference = testData.conference;
    }),
  );

  describe('getFullPercentage', () => {
    it('returns 0 when there is no limit', () => {
      conference.useLimit = false;

      expect(conferenceLimits.getFullPercentage(conference)).toBe(0);
    });

    it('calculates the percentage of used slots', () => {
      conference.useLimit = true;
      conference.numberSlotsLimit = 10;
      conference.availableSlots = 6;

      expect(conferenceLimits.getFullPercentage(conference)).toBe(40);
    });

    it('returns 0 when all slots are available', () => {
      conference.useLimit = true;
      conference.numberSlotsLimit = 10;
      conference.availableSlots = 10;

      expect(conferenceLimits.getFullPercentage(conference)).toBe(0);
    });

    it('returns 100 when all slots are used', () => {
      conference.useLimit = true;
      conference.numberSlotsLimit = 10;
      conference.availableSlots = 0;

      expect(conferenceLimits.getFullPercentage(conference)).toBe(100);
    });
  });
});
