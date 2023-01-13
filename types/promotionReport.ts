import { Registration } from 'registration';

export interface PromotionRegistrationInfo {
  id: string;
  promotionId: string;
  registrationId: string;
  glAccount: string;
  productCode: string | null;
  error: string;
  reportId: string;
}

export interface PromotionReport {
  id: string;
  conferenceId: string;
  promotionRegistrationInfoList: Array<PromotionRegistrationInfo>;
  registrationList: Array<Registration>;
  transactionTimestamp: string;
}
