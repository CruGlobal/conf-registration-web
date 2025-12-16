import { BasePromotion } from 'basePromotion';

// Conference-specific promotion
export interface Promotion extends BasePromotion {
  conferenceId: string;
  registrantTypeIds: Array<string>;
}
