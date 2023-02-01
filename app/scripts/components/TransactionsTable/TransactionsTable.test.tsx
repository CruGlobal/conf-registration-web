import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  accountTransfer,
  promoRegistration,
  registrationDoe,
} from '../../../../__tests__/fixtures';
import { TransactionsTable, TransactionsTableProps } from './TransactionsTable';

describe('TransactionsTable component', () => {
  const setTransactionSelected = jest.fn();
  const props: TransactionsTableProps<'accountTransfer'> = {
    rowType: 'accountTransfer',
    rows: registrationDoe.groupRegistrants.map((registrant, index) => ({
      ...accountTransfer,
      type: 'accountTransfer',
      id: index.toString(),
      firstName: registrant.firstName,
      lastName: registrant.lastName,
      remainingBalance: 0,
      error: index === 0 ? 'Posting Error' : '',
      transaction: { ...accountTransfer },
    })),
    currentReportId: null,
    currencySymbol: '$',
    emptyMessage: 'No Rows',
    headerExtra: <button>Select All</button>,
    localizedCurrency: jest.fn(),
    selectable: true,
    selectedTransactions: new Set(),
    setTransactionSelected,
    title: 'Table Title',
    viewPayments: jest.fn(),
  };

  it('renders rows', () => {
    const { getAllByRole } = render(<TransactionsTable {...props} />);

    // 1 header row and 2 transaction rows
    expect(getAllByRole('row')).toHaveLength(3);
  });

  it('selects rows', async () => {
    const { getAllByRole } = render(<TransactionsTable {...props} />);

    await userEvent.click(getAllByRole('checkbox')[0]);

    expect(setTransactionSelected).toHaveBeenCalledWith(
      props.rows[0].transaction,
      true,
    );
  });

  it('unselects rows', async () => {
    const { getAllByRole } = render(
      <TransactionsTable
        {...props}
        selectedTransactions={new Set([props.rows[0].transaction])}
      />,
    );

    await userEvent.click(getAllByRole('checkbox')[0]);

    expect(setTransactionSelected).toHaveBeenCalledWith(
      props.rows[0].transaction,
      false,
    );
  });

  it('hides checkboxes when selectable is false', () => {
    const { queryAllByRole } = render(
      <TransactionsTable {...props} selectable={false} />,
    );

    expect(queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('displays the error', () => {
    const { getByTestId } = render(<TransactionsTable {...props} />);

    expect(getByTestId('transactions-table-error-popover')).toBeInTheDocument();
  });

  it('alternates row background color', () => {
    const { getAllByRole } = render(<TransactionsTable {...props} />);

    // Ignore the header row
    const rows = getAllByRole('row').slice(1);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveClass('active');
    expect(rows[1]).not.toHaveClass('active');
  });

  it('displays the title', () => {
    const { getByText } = render(<TransactionsTable {...props} />);

    expect(getByText('Table Title')).toBeInTheDocument();
  });

  it('displays the empty message when there are no rows', () => {
    const { getByText } = render(<TransactionsTable {...props} rows={[]} />);

    expect(getByText('No Rows')).toBeInTheDocument();
  });

  it('hides the empty message when there are rows', () => {
    const { queryByText } = render(<TransactionsTable {...props} />);

    expect(queryByText('No Rows')).not.toBeInTheDocument();
  });

  it('opens the payments modal', async () => {
    const { getAllByRole } = render(<TransactionsTable {...props} />);

    await userEvent.click(
      getAllByRole('button', {
        description: 'View/Edit Payments & Expenses',
      })[0],
    );

    expect(props.viewPayments).toHaveBeenCalledWith('registration-doe');
  });

  it('shows the account transfer columns', () => {
    const { getByRole, getAllByRole } = render(
      <TransactionsTable {...props} />,
    );

    expect(
      getByRole('columnheader', { name: 'GL Account' }),
    ).toBeInTheDocument();

    expect(getAllByRole('cell', { name: '10000' })).not.toHaveLength(0);

    expect(
      getByRole('columnheader', { name: 'Reference' }),
    ).toBeInTheDocument();

    expect(getAllByRole('cell', { name: '1234567' })).not.toHaveLength(0);
  });

  it('shows the promo upload columns', () => {
    const { queryByRole } = render(
      <TransactionsTable
        {...props}
        rowType="promotion"
        rows={props.rows.map((row) => ({
          ...row,
          type: 'promotion',
          transaction: promoRegistration,
        }))}
        selectedTransactions={new Set()}
        setTransactionSelected={jest.fn()}
      />,
    );

    expect(
      queryByRole('columnheader', { name: 'GL Account' }),
    ).not.toBeInTheDocument();

    expect(
      queryByRole('columnheader', { name: 'Reference' }),
    ).not.toBeInTheDocument();
  });
});
