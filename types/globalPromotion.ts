import { BasePromotion } from 'basePromotion';

export interface GlobalPromotion extends BasePromotion {
  ministryId: string;
  ministryActivityId: string | null;
}
