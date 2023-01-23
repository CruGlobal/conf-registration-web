import { AccountTransfer } from 'accountTransfer';
import { Nullable } from 'helpers';
import { Promotion } from 'promotion';
import { RegistrantType } from './registrant';

export type ExpenseType =
  | 'REGISTRATION'
  | 'MISCELLANEOUS_ITEM'
  | 'CHILDCARE'
  | 'STAFF_TAXABLE_ITEM';
export interface Expense {
  id: string;
  registrationId: string;
  amount: number;
  createdByIdentityId: string | null;
  description: string;
  createdTimestamp: string | null;
  removed: boolean | null;
  expenseType: ExpenseType | null;
}

export type PaymentStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'DENIED'
  | 'PENDING'
  | 'RECEIVED';
export type PaymentType =
  | 'CREDIT_CARD'
  | 'OFFLINE_CREDIT_CARD'
  | 'CASH'
  | 'CHECK'
  | 'SCHOLARSHIP'
  | 'TRANSFER'
  | 'REFUND'
  | 'ADDITIONAL_EXPENSE';
export type AccountType = 'STAFF' | 'NON_US_STAFF' | 'MINISTRY';

export interface Payment {
  id: string;
  registrationId: string;
  amount: number;
  transactionDatetime: string;
  paymentType: PaymentType;
  refundedPaymentId: string;
  description: string;
  status: PaymentStatus | null;
  refundChannel: PaymentType | null;
  creditCard: Nullable<{
    number: string;
    nameOnCard: string;
    network: string;
    expirationMonth: string;
    expirationYear: string;
    lastFourDigits: string;
    cvvNumber: string;
    transactionId: string;
    billingAddress: string;
    billingCity: string;
    billingState: string;
    billingCountry: string;
    billingZip: string;
  }>;
  offlineCreditCard: Nullable<{
    transactionId: string;
  }>;
  transfer: Nullable<{
    businessUnit: string;
    operatingUnit: string;
    department: string;
    projectId: string;
    accountNumber: string;
    accountType: AccountType;
  }>;
  scholarship: Nullable<{
    staffApprovalName: string;
    staffEmail: string;
    approvalHash: string;
    requesterName: string;
    requesterEmail: string;
    businessUnit: string;
    operatingUnit: string;
    department: string;
    projectId: string;
    accountNumber: string;
    accountType: AccountType;
  }>;
  check: Nullable<{
    checkNumber: string;
    checkType: 'PARTICIPANT_PAYMENT' | 'SUPPORTER_DONATION';
  }>;
  amountReported: number;
  transactionId: string;
  lastUpdatedTimestamp: string;
  reported: boolean;
}

export interface Registration {
  accountTransfers: Array<AccountTransfer>;
  calculatedAdditionalDiscounts: number;
  calculatedMinimumDeposit: number;
  calculatedPromotionDiscounts: number;
  calculatedTotalDue: number;
  completed: boolean;
  completedTimestamp: string;
  conferenceId: string;
  createdTimestamp: string;
  expenses: Array<Expense>;
  groupId: string;
  groupRegistrants: Array<RegistrantType>;
  id: string;
  lastUpdatedTimestamp: string;
  pastPayments: Array<Payment>;
  primaryRegistrantId: string;
  promotions: Array<Promotion>;
  registrants: Array<RegistrantType>;
  remainingBalance: number;
  reported: boolean;
  totalPaid: number;
  userId: string;
}
