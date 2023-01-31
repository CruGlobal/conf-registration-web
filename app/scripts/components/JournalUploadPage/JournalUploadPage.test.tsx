import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cloneDeep } from 'lodash';
import React from 'react';
import { $Http, $RootScope, $Window, ModalMessage } from 'injectables';
import { Permissions } from 'permissions';
import {
  conference,
  journalReport,
  promoReport,
  registrationsData,
} from '../../../../__tests__/fixtures';
import { JournalUploadService } from '../../services/journalUploadService';
import { JournalUploadPage, JournalUploadPageProps } from './JournalUploadPage';

jest.mock('../../hooks/usePaymentsModal', () => {
  const openModalPromise = Promise.resolve();
  return {
    openModalPromise,
    usePaymentsModal: () => ({
      open: () => openModalPromise,
    }),
  };
});

const openModal = jest.fn();
const scrollTo = jest.fn();

describe('JournalUploadPage component', () => {
  const getRegistrationData = jest.fn().mockResolvedValue(registrationsData);
  const loadAccountTransferReportPromise = Promise.resolve(journalReport);
  const loadAccountTransferReport = jest
    .fn()
    .mockReturnValue(loadAccountTransferReportPromise);
  const loadAccountTransferReportsPromise = Promise.resolve([journalReport]);
  const loadAllAccountTransferReports = jest
    .fn()
    .mockReturnValue(loadAccountTransferReportsPromise);
  const submitPromise = Promise.resolve(promoReport);
  const submitAccountTransfers = jest.fn().mockReturnValue(submitPromise);
  const journalUploadService = {
    getRegistrationData,
    loadAccountTransferReport,
    loadAllAccountTransferReports,
    submitAccountTransfers,
  } as unknown as JournalUploadService;

  const props: JournalUploadPageProps = {
    $filter: jest.fn((str) => str).mockReturnValue((str: string) => str),
    $rootScope: {} as $RootScope,
    $http: { get: jest.fn() } as unknown as $Http,
    $window: { scrollTo } as unknown as $Window,
    $uibModal: { open: openModal },
    journalUploadService,
    modalMessage: { error: jest.fn() } as unknown as ModalMessage,
    resolve: {
      registrationsData: registrationsData,
      conference,
      permissions: {} as Permissions,
      reports: [journalReport],
    },
  };

  it('scrolls to the top when the page changes', async () => {
    const propsMultiplePages = {
      ...props,
      resolve: {
        ...props.resolve,
        registrationsData: {
          ...props.resolve.registrationsData,
          meta: {
            ...props.resolve.registrationsData.meta,
            totalRegistrantsFilter: 100,
          },
        },
      },
    };
    const { getByRole } = render(<JournalUploadPage {...propsMultiplePages} />);

    await userEvent.click(getByRole('button', { name: '3' }));

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('does not scroll to the top when another filter changes', async () => {
    const { getByRole } = render(<JournalUploadPage {...props} />);

    await userEvent.selectOptions(
      getByRole('combobox', { name: 'Registrant type:' }),
      ['Type 1'],
    );

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to the top when the report changes', async () => {
    const { getByRole } = render(<JournalUploadPage {...props} />);

    await userEvent.selectOptions(
      getByRole('combobox', { name: 'Report creation date:' }),
      ['2022-01-01 12:00:00'],
    );

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows a placeholder when there are no transactions', async () => {
    const { getByText } = render(
      <JournalUploadPage
        {...props}
        resolve={{
          ...props.resolve,
          registrationsData: {
            ...registrationsData,
            registrations: [],
          },
        }}
      />,
    );

    expect(
      getByText('No transactions have been found to match your filter.'),
    ).toBeInTheDocument();
  });

  it('shows a placeholder when there are no transactions on the page', async () => {
    const { getByText } = render(
      <JournalUploadPage
        {...props}
        resolve={{
          ...props.resolve,
          registrationsData: {
            ...registrationsData,
            meta: {
              ...registrationsData.meta,
              totalPages: 2,
            },
            registrations: [],
          },
        }}
      />,
    );

    expect(
      getByText(
        'No transactions have been found to match your filter on this page.',
      ),
    ).toBeInTheDocument();
  });

  it('add all checks all', async () => {
    const { getAllByRole, getByRole } = render(
      <JournalUploadPage {...props} />,
    );

    await userEvent.click(
      getByRole('button', { name: 'Add All To Journal Report' }),
    );

    expect(getAllByRole('checkbox', { checked: true })).toHaveLength(5);
  });

  it('add all is still visible after adding one', async () => {
    const { getAllByRole, getByRole } = render(
      <JournalUploadPage {...props} />,
    );

    await userEvent.click(getAllByRole('checkbox')[0]);
    await userEvent.click(
      getByRole('button', { name: 'Add All To Journal Report' }),
    );

    expect(getAllByRole('checkbox', { checked: true })).toHaveLength(5);
  });

  it('remove all unselects all', async () => {
    const { getAllByRole, getByRole } = render(
      <JournalUploadPage {...props} />,
    );

    await userEvent.click(
      getByRole('button', { name: 'Add All To Journal Report' }),
    );
    await userEvent.click(
      getByRole('button', { name: 'Remove All From Journal Report' }),
    );

    expect(getAllByRole('checkbox', { checked: false })).toHaveLength(5);
  });

  describe('with errors', () => {
    const propsSomeErrors = cloneDeep(props);
    propsSomeErrors.resolve.registrationsData.registrations[0].accountTransfers.forEach(
      (accountTransfer) => {
        accountTransfer.error = 'Error';
      },
    );

    it('hides add all when all have errors', async () => {
      const propsAllErrors = cloneDeep(props);
      propsAllErrors.resolve.registrationsData.registrations.forEach(
        (registration) => {
          registration.accountTransfers.forEach((accountTransfer) => {
            accountTransfer.error = 'Error';
          });
        },
      );

      const { queryByRole } = render(<JournalUploadPage {...propsAllErrors} />);

      expect(
        queryByRole('button', { name: 'Add All To Journal Report' }),
      ).not.toBeInTheDocument();
    });

    it('add all only checks registrations without errors', async () => {
      const { getAllByRole, getByRole } = render(
        <JournalUploadPage {...propsSomeErrors} />,
      );

      await userEvent.click(
        getByRole('button', { name: 'Add All To Journal Report' }),
      );

      expect(getAllByRole('checkbox', { checked: true })).toHaveLength(3);
      expect(getAllByRole('checkbox', { checked: false })).toHaveLength(2);
    });

    it('remove all only unchecks registrations without errors', async () => {
      const { getAllByRole, getByRole } = render(
        <JournalUploadPage {...propsSomeErrors} />,
      );

      expect(getAllByRole('checkbox')).toHaveLength(5);
      for (const checkbox of getAllByRole('checkbox') as HTMLInputElement[]) {
        await userEvent.click(checkbox);
      }
      await userEvent.click(
        getByRole('button', { name: 'Remove All From Journal Report' }),
      );

      expect(getAllByRole('checkbox', { checked: true })).toHaveLength(2);
      expect(getAllByRole('checkbox', { checked: false })).toHaveLength(3);
    });
  });

  it('handles submit and viewing the report', async () => {
    const { getByRole } = render(<JournalUploadPage {...props} />);

    const openModalPromise = Promise.resolve('journal-report-2');
    openModal.mockImplementation(({ resolve }) => {
      resolve.conference();
      resolve.queryParameters();
      resolve.report();
      return { result: openModalPromise };
    });

    const loadAccountTransferReportsPromise = Promise.resolve([
      journalReport,
      { ...journalReport, id: 'journal-report-2' },
    ]);
    loadAllAccountTransferReports.mockReturnValue(
      loadAccountTransferReportsPromise,
    );

    await act(async () => {
      await loadAccountTransferReportsPromise;
    });
    await userEvent.click(
      getByRole('button', { name: 'Add All To Journal Report' }),
    );
    await userEvent.click(
      getByRole('button', { name: 'Submit Journal Upload' }),
    );
    await act(async () => {
      await submitPromise;
    });

    expect(loadAllAccountTransferReports).toHaveBeenCalledTimes(1);
    expect(submitAccountTransfers).toHaveBeenCalledTimes(1);
    expect(submitAccountTransfers.mock.calls[0][0]).toMatchObject([
      { id: 'account-transfer-1' },
      { id: 'account-transfer-2' },
      { id: 'account-transfer-3' },
      { id: 'account-transfer-4' },
      { id: 'account-transfer-5' },
    ]);

    expect(
      getByRole('combobox', { name: 'Report creation date:' }),
    ).toHaveValue('journal-report-2');
  });

  it('handles submit and not viewing the report', async () => {
    const { getByRole } = render(<JournalUploadPage {...props} />);

    openModal.mockReturnValue({
      result: Promise.resolve(null),
    });

    await userEvent.click(
      getByRole('button', { name: 'Add All To Journal Report' }),
    );
    await userEvent.click(
      getByRole('button', { name: 'Submit Journal Upload' }),
    );
    await act(async () => {
      await submitPromise;
    });

    expect(getRegistrationData).toHaveBeenCalledTimes(1);
  });

  it('handles submit and timeout', async () => {
    const { getByRole } = render(<JournalUploadPage {...props} />);

    submitAccountTransfers.mockResolvedValue(null);

    await userEvent.click(
      getByRole('button', { name: 'Add All To Journal Report' }),
    );
    await userEvent.click(
      getByRole('button', { name: 'Submit Journal Upload' }),
    );
    await act(async () => {
      await submitPromise;
    });

    expect(openModal).not.toHaveBeenCalled();
  });

  describe('payment modal', () => {
    let openModalPromise: Promise<void>;
    beforeEach(async () => {
      // Get the promise from the mock
      const module = await import('../../hooks/usePaymentsModal');
      openModalPromise = (module as any).openModalPromise;
    });

    it('refreshes the registrations on close', async () => {
      const { getAllByRole } = render(<JournalUploadPage {...props} />);

      expect(getRegistrationData).toHaveBeenCalledTimes(0);

      await userEvent.click(
        getAllByRole('button', {
          description: 'View/Edit Payments & Expenses',
        })[0],
      );

      await act(async () => {
        await openModalPromise;
      });

      expect(getRegistrationData).toHaveBeenCalledTimes(1);
    });
  });
});
