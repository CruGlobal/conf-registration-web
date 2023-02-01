import { AnswerType } from 'answer';

export interface RegistrantType {
  answers: Array<AnswerType>;
  calculatedEarlyRegistrationDiscounts: number;
  calculatedPromotionDiscounts: number;
  calculatedTotalDue: number;
  checkedInTimestamp: string | null;
  createdTimestamp: string;
  email: string;
  firstName: string;
  groupId: string;
  id: string;
  lastName: string;
  lastUpdatedTimestamp: string;
  registrantTypeId: string;
  registrationId: string;
  userId: string;
  withdrawn: boolean;
  withdrawnTimestamp: string | null;
  eformStatus: string | null;
}
