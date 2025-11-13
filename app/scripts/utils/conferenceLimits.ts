import { Conference } from 'conference';

export const getFullPercentage = (conference: Conference): number => {
  if (!conference.useLimit) {
    return 0;
  }

  const usedSlots = conference.numberSlotsLimit - conference.availableSlots;
  return (usedSlots / conference.numberSlotsLimit) * 100;
};
