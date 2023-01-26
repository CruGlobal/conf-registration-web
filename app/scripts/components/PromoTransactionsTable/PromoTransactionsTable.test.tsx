import { render } from '@testing-library/react';
import React from 'react';
import { PromoRegistration } from 'promoRegistration';
import {
  promotionAll,
  promotionOne,
  registrationBright,
  registrationDoe,
} from '../../../../__tests__/fixtures';
import {
  PromoTransactionsTable,
  PromoTransactionsTableProps,
} from './PromoTransactionsTable';

describe('PromoTransactionsTable component', () => {
  const promoRegistrations: Array<PromoRegistration> = [
    {
      promotion: promotionAll,
      registration: registrationDoe,
      successfullyPosted: true,
      error: undefined,
    },
    {
      promotion: promotionOne,
      registration: registrationDoe,
      successfullyPosted: true,
      error: undefined,
    },
    {
      promotion: promotionAll,
      registration: registrationBright,
      successfullyPosted: true,
      error: undefined,
    },
  ];
  const setTransactionSelected = jest.fn();
  const props: PromoTransactionsTableProps = {
    promoRegistrations,
    currentReportId: null,
    currencySymbol: '$',
    localizedCurrency: jest.fn(),
    selectable: true,
    selectedTransactions: new Set(),
    setTransactionSelected,
    title: 'Promo Transactions',
    viewPayments: jest.fn(),
  };

  it('renders rows', () => {
    const { getAllByRole } = render(<PromoTransactionsTable {...props} />);

    // 1 header row, 2 Doe/All rows because the promo code applies to all registrant, 1 Doe/One row because
    // the promo code only applies to the primary registrant, and 1 Bright/All row for 5 total rows
    expect(getAllByRole('row')).toHaveLength(5);
  });
});
