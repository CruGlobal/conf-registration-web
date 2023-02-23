import { useMemo } from 'react';
import { AccountTransfer } from 'accountTransfer';
import { Registration } from 'registration';
import {
  AccountTransferRow,
  TransactionsTable,
  TransactionsTableProps,
} from '../TransactionsTable/TransactionsTable';

export interface JournalTransactionsTableProps
  extends Omit<TransactionsTableProps<'accountTransfer'>, 'rowType' | 'rows'> {
  accountTransfers: Array<AccountTransfer>;
  registrationsList: Array<Registration>;
}

export const JournalTransactionsTable = ({
  accountTransfers,
  registrationsList,
  ...props
}: JournalTransactionsTableProps): JSX.Element => {
  const rows = useMemo(
    () =>
      accountTransfers.map(
        (transfer, index): AccountTransferRow => ({
          ...transfer,
          type: 'accountTransfer',
          id: `${transfer.registrationId}|${index}`,
          transaction: transfer,
          // If we can't find the balance, say that it is positive
          remainingBalance:
            registrationsList.find(({ id }) => id === transfer.registrationId)
              ?.remainingBalance ?? 1,
        }),
      ),
    [accountTransfers],
  );

  return <TransactionsTable rows={rows} rowType="accountTransfer" {...props} />;
};
