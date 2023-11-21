import { AccountTransfer } from 'accountTransfer';

export interface JournalReport {
  id: string;
  conferenceId: string;
  accountTransfers: Array<AccountTransfer>;
  transactionTimestamp: string;
}
