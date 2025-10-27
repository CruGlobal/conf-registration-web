import { Promotion } from 'promotion';

export interface GlobalPromotion extends Omit<Promotion, 'conferenceId'> {
  active: boolean;
  ministryId: string;
  ministryActivityId: string | null;
  numberLimit?: number | null;
}
