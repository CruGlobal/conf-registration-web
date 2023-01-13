import { AccountTransfer } from 'accountTransfer';

export interface Report {
  id: string;
  conferenceId: string;
  accountTransfers: Array<AccountTransfer>;
  transactionTimestamp: string;
}
