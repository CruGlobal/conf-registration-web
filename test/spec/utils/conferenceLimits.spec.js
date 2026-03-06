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
      conference.useTotalCapacity = false;

      expect(conferenceLimits.getFullPercentage(conference)).toBe(0);
    });

    it('calculates the percentage of used available capacity', () => {
      conference.useTotalCapacity = true;
      conference.totalCapacity = 10;
      conference.availableCapacity = 6;

      expect(conferenceLimits.getFullPercentage(conference)).toBe(40);
    });

    it('returns 0 when capacity is fully available', () => {
      conference.useTotalCapacity = true;
      conference.totalCapacity = 10;
      conference.availableCapacity = 10;

      expect(conferenceLimits.getFullPercentage(conference)).toBe(0);
    });

    it('returns 100 when all capacity is used', () => {
      conference.useTotalCapacity = true;
      conference.totalCapacity = 10;
      conference.availableCapacity = 0;

      expect(conferenceLimits.getFullPercentage(conference)).toBe(100);
    });
  });
});
