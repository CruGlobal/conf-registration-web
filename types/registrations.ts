import { PromotionRegistrationInfo } from 'promotionReport';
import { Registration } from 'registration';

export interface AccountTransferEvent {
  amount: number;
  businessUnit: string;
  departmentId: string;
  description: string;
  expenseType: string;
  glAccount: string;
  operatingUnit: string;
  productCode: string;
  projectId: string;
}

export interface RegistrationsData {
  meta: {
    totalRegistrants: number;
    totalRegistrantsFilter: number;
    currentPage: number;
    totalPages: number;
    accountTransferEvents: Array<AccountTransferEvent>;
    promotionRegistrationInfoList: Array<PromotionRegistrationInfo>;
  };
  registrations: Array<Registration>;
}
