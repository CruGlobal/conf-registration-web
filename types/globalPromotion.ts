import { Promotion } from 'promotion';

export interface GlobalPromotion
  extends Omit<Promotion, 'conferenceId' | 'registrantTypeIds'> {
  ministryId: string;
  ministryActivityId: string | null;
  numberLimit: number | null;
}
