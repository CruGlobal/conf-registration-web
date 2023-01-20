import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PromoTransactionsTable,
  PromoTransactionsTableProps,
} from './PromoTransactionsTable';
import { PromoRegistration } from '../../hooks/usePromoRegistrationList';
import {
  promotionAll,
  promotionOne,
  registrationBright,
  registrationDoe,
} from '../../../../__tests__/fixtures';

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
  const setRegistrationSelected = jest.fn();
  const props: PromoTransactionsTableProps = {
    promoRegistrations,
    currentReportId: null,
    currencySymbol: '$',
    localizedCurrency: jest.fn(),
    selectedRegistrations: new Set(),
    setRegistrationSelected,
    title: 'Promo Transactions',
    viewPayments: jest.fn(),
  };

  it('renders rows', () => {
    const { getAllByRole } = render(<PromoTransactionsTable {...props} />);

    // 1 header row, 2 Doe/All rows because the promo code applies to all registrant, 1 Doe/One row because
    // the promo code only applies to the primary registrant, and 1 Bright/All row for 6 total rows
    expect(getAllByRole('row')).toHaveLength(5);
  });

  it('selects registrants', async () => {
    const { getAllByRole } = render(<PromoTransactionsTable {...props} />);

    await userEvent.click(getAllByRole('checkbox')[0]);

    expect(setRegistrationSelected).toHaveBeenCalledWith(
      promoRegistrations[0],
      true,
    );
  });

  it('unselects registrants', async () => {
    const { getAllByRole } = render(
      <PromoTransactionsTable
        {...props}
        selectedRegistrations={new Set(promoRegistrations.slice(0, 1))}
      />,
    );

    await userEvent.click(getAllByRole('checkbox')[0]);

    expect(setRegistrationSelected).toHaveBeenCalledWith(
      promoRegistrations[0],
      false,
    );
  });

  it('selects all registrants in group', () => {
    const { getAllByRole } = render(
      <PromoTransactionsTable
        {...props}
        selectedRegistrations={new Set(promoRegistrations.slice(0, 1))}
      />,
    );

    expect(getAllByRole('checkbox', { checked: true })).toHaveLength(2);
  });
});
