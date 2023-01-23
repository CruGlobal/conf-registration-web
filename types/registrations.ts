import { AccountTransfer } from 'accountTransfer';
import { PromotionRegistrationInfo } from 'promotionReport';
import { Registration } from 'registration';

export interface RegistrationsData {
  meta: {
    totalRegistrants: number;
    totalRegistrantsFilter: number;
    currentPage: number;
    totalPages: number;
    accountTransferEvents: Array<AccountTransfer>;
    promotionRegistrationInfoList?: Array<PromotionRegistrationInfo>;
  };
  registrations: Array<Registration>;
}
