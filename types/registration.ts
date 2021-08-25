import { RegistrantType } from './registrant';

export interface RegistrationType {
  accountTransfers: null;
  calculatedAdditionalDiscounts: number;
  calculatedMinimumDeposit: number;
  calculatedPromotionDiscounts: number;
  calculatedTotalDue: number;
  completed: boolean;
  completedTimestamp: string;
  conferenceId: string;
  createdTimestamp: string;
  expenses: Array<any>;
  groupId: string;
  groupRegistrants: Array<any>;
  id: string;
  registrants: Array<RegistrantType>;
  remainingBalance: number;
  reported: boolean;
  totalPaid: number;
  userId: string;
}
