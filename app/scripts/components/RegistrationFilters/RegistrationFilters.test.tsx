import React from 'react';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationFilters } from './RegistrationFilters';
import { RegistrationQueryParams } from 'injectables';
import { conference } from '../../../../__tests__/fixtures';

const defaultQueryParams = {
  filter: '',
  page: 1,
} as RegistrationQueryParams;

describe('RegistrationFilters component', () => {
  it('handles changes', async () => {
    const onQueryChange = jest.fn();
    const { getByTestId } = render(
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

    await userEvent.selectOptions(getByTestId('registration-filters-payment'), [
      'partial',
    ]);

    expect(onQueryChange).toHaveBeenCalledWith({
      filter: '',
      page: 1,
      filterPayment: 'partial',
    });
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
    const { getByTestId } = render(
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
        getByTestId('registration-filters-registrant-type').children,
      ).map((child) => child.innerHTML),
    ).toEqual(['-Any-', 'Type 1', 'Type 2', 'Type 3']);
  });

  it('toggles more filters', async () => {
    const onQueryChange = jest.fn();
    const { getByLabelText, queryByLabelText, getByText } = render(
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
    await userEvent.click(getByText('Filters'));

    expect(
      getByLabelText('Journal Submission Errors', { exact: false }),
    ).toBeInTheDocument();
  });
});
