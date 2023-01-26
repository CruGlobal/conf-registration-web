import { render } from '@testing-library/react';
import { AccountTransfer } from 'accountTransfer';
import React from 'react';
import {
  registrationDoe,
  accountTransfer,
  registrationBright,
} from '../../../../__tests__/fixtures';
import {
  JournalTransactionsTable,
  JournalTransactionsTableProps,
} from './JournalTransactionsTable';

describe('JournalTransactionsTable component', () => {
  const setTransactionSelected = jest.fn();
  const props: JournalTransactionsTableProps = {
    accountTransfers: registrationDoe.groupRegistrants.map(
      (registrant, index): AccountTransfer => ({
        ...accountTransfer,
        id: `account-transfer-${index}`,
        registrationId:
          index === 0 ? registrationDoe.id : registrationBright.id,
        firstName: registrant.firstName,
        lastName: registrant.lastName,
      }),
    ),
    registrationsList: [{ ...registrationDoe, remainingBalance: -100 }],
    currentReportId: null,
    currencySymbol: '$',
    localizedCurrency: jest.fn(),
    selectable: true,
    selectedTransactions: new Set(),
    setTransactionSelected,
    title: 'Journal Transactions',
    viewPayments: jest.fn(),
  };

  it('calculates the remaining balance defaulting to positive', () => {
    const { getAllByRole } = render(<JournalTransactionsTable {...props} />);

    expect(getAllByRole('button')[0]).toHaveClass('btn-danger');
    expect(getAllByRole('button')[1]).toHaveClass('btn-default');
  });
});
