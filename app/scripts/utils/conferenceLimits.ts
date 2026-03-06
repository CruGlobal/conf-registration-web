import { Conference } from 'conference';

export const getFullPercentage = (conference: Conference): number => {
  if (!conference.useTotalCapacity) {
    return 0;
  }

  const usedCapacity = conference.totalCapacity - conference.availableCapacity;
  return (usedCapacity / conference.totalCapacity) * 100;
};
