import { act, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationQueryParams } from 'injectables';
import { conference } from '../../../../__tests__/fixtures';
import { RegistrationFilters } from './RegistrationFilters';

const defaultQueryParams = {
  filter: '',
  page: 1,
} as RegistrationQueryParams;

describe('RegistrationFilters component', () => {
  it('handles changes', async () => {
    const onQueryChange = jest.fn();
    const { getByRole, getByText } = render(
      <RegistrationFilters
        defaultQueryParams={defaultQueryParams}
        conference={conference}
        onQueryChange={onQueryChange}
        showPagination
        pageCount={10}
      >
        Content
      </RegistrationFilters>,
    );
    await userEvent.click(getByRole('button', { name: 'Filters' }));

    await userEvent.selectOptions(
      getByRole('combobox', { name: 'Payment status:' }),
      ['partial'],
    );

    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filterPayment: 'partial',
      }),
    );

    await userEvent.selectOptions(
      getByRole('combobox', { name: 'Registrant type:' }),
      ['Type 1'],
    );

    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filterRegType: 'registrant-type-1',
      }),
    );

    await userEvent.selectOptions(
      getByRole('combobox', { name: 'Payment type:' }),
      ['Account Transfer'],
    );

    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filterAccountTransfersByPaymentType: 'ACCOUNT_TRANSFER',
      }),
    );

    await userEvent.selectOptions(
      getByRole('combobox', { name: 'Expense type:' }),
      ['Registration'],
    );

    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filterAccountTransfersByExpenseType: 'REGISTRATION',
      }),
    );

    await userEvent.click(
      within(getByText('Journal submission errors')).getByRole('radio', {
        name: 'Hide',
      }),
    );

    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        filterAccountTransferErrors: 'no',
      }),
    );

    await userEvent.click(
      within(getByText('Incomplete registrations')).getByRole('radio', {
        name: 'Hide',
      }),
    );

    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        includeIncomplete: 'no',
      }),
    );

    await userEvent.click(
      within(getByText('Checked-in registrations')).getByRole('radio', {
        name: 'Hide',
      }),
    );

    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        includeCheckedin: 'no',
      }),
    );

    await userEvent.click(
      within(getByText('Withdrawn registrations')).getByRole('radio', {
        name: 'Hide',
      }),
    );

    expect(onQueryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        includeWithdrawn: 'no',
      }),
    );
  });

  it('debounces search filter', async () => {
    const onQueryChange = jest.fn();
    const { getByLabelText } = render(
      <RegistrationFilters
        defaultQueryParams={defaultQueryParams}
        conference={conference}
        onQueryChange={onQueryChange}
        showPagination
        pageCount={10}
      >
        Content
      </RegistrationFilters>,
    );

    const filter = getByLabelText('Search (visible columns only)', {
      exact: false,
    });
    await userEvent.type(filter, 'Fil');

    expect(onQueryChange).not.toHaveBeenCalled();

    await userEvent.type(filter, 'ter');

    expect(onQueryChange).not.toHaveBeenCalled();

    await act(async () => {
      // eslint-disable-next-line angular/timeout-service
      await new Promise((resolve) => setTimeout(resolve, 700));
    });

    expect(onQueryChange).toHaveBeenCalledWith({ filter: 'Filter', page: 1 });
  });

  it('clears the search filter', async () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
      <RegistrationFilters
        defaultQueryParams={{ ...defaultQueryParams, filter: 'Filter' }}
        conference={conference}
        onQueryChange={onQueryChange}
        showPagination
        pageCount={10}
      >
        Content
      </RegistrationFilters>,
    );

    await userEvent.click(getByTestId('registration-filters-clear'));
    await act(async () => {
      // eslint-disable-next-line angular/timeout-service
      await new Promise((resolve) => setTimeout(resolve, 700));
    });

    expect(onQueryChange).toHaveBeenCalledWith({ filter: '', page: 1 });
  });

  it('hides filters', () => {
    const onQueryChange = jest.fn();
    const { getByLabelText, queryByLabelText } = render(
      <RegistrationFilters
        defaultQueryParams={defaultQueryParams}
        conference={conference}
        onQueryChange={onQueryChange}
        showPagination
        pageCount={10}
        hiddenFilters={['filterRegType']}
      >
        Content
      </RegistrationFilters>,
    );

    expect(
      queryByLabelText('Registrant type', { exact: false }),
    ).not.toBeInTheDocument();

    expect(
      getByLabelText('Payment type', { exact: false }),
    ).toBeInTheDocument();
  });

  it('has registrant type options', () => {
    const onQueryChange = jest.fn();
    const { getByRole } = render(
      <RegistrationFilters
        defaultQueryParams={defaultQueryParams}
        conference={conference}
        onQueryChange={onQueryChange}
        showPagination
        pageCount={10}
      >
        Content
      </RegistrationFilters>,
    );

    expect(
      Array.from(
        getByRole('combobox', { name: 'Registrant type:' }).children,
      ).map((child) => child.innerHTML),
    ).toEqual(['-Any-', 'Type 1', 'Type 2', 'Type 3']);
  });

  it('toggles more filters', async () => {
    const onQueryChange = jest.fn();
    const { getByLabelText, queryByLabelText, getByRole } = render(
      <RegistrationFilters
        defaultQueryParams={defaultQueryParams}
        conference={conference}
        onQueryChange={onQueryChange}
        showPagination
        pageCount={10}
      >
        Content
      </RegistrationFilters>,
    );

    expect(
      queryByLabelText('Journal Submission Errors', { exact: false }),
    ).not.toBeInTheDocument();
    await userEvent.click(getByRole('button', { name: 'Filters' }));

    expect(
      getByLabelText('Journal Submission Errors', { exact: false }),
    ).toBeInTheDocument();
  });

  it('changes the page', async () => {
    const onQueryChange = jest.fn();
    const { getByRole } = render(
      <RegistrationFilters
        defaultQueryParams={defaultQueryParams}
        conference={conference}
        onQueryChange={onQueryChange}
        showPagination
        pageCount={10}
      >
        Content
      </RegistrationFilters>,
    );

    await userEvent.click(getByRole('button', { name: '3' }));

    expect(onQueryChange).toHaveBeenCalledWith({
      filter: '',
      page: 3,
    });
  });

  it('resets the page when a filter changes', async () => {
    const onQueryChange = jest.fn();
    const { getByRole } = render(
      <RegistrationFilters
        defaultQueryParams={{ ...defaultQueryParams, page: 3 }}
        conference={conference}
        onQueryChange={onQueryChange}
        showPagination
        pageCount={10}
      >
        Content
      </RegistrationFilters>,
    );

    await userEvent.selectOptions(
      getByRole('combobox', { name: 'Payment status:' }),
      ['partial'],
    );

    expect(onQueryChange).toHaveBeenCalledWith({
      filter: '',
      filterPayment: 'partial',
      page: 1,
    });
  });

  it('changes the page size', async () => {
    const onQueryChange = jest.fn();
    const { getByRole } = render(
      <RegistrationFilters
        defaultQueryParams={defaultQueryParams}
        conference={conference}
        onQueryChange={onQueryChange}
        showPagination
        pageCount={10}
      >
        Content
      </RegistrationFilters>,
    );

    await userEvent.click(getByRole('radio', { name: '100' }));

    expect(onQueryChange).toHaveBeenCalledWith({
      filter: '',
      page: 1,
      limit: 100,
    });
  });
});
