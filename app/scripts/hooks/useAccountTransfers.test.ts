import { renderHook } from '@testing-library/react-hooks';
import { JournalUploadService, RegistrationQueryParams } from 'injectables';
import { JournalReport } from 'journalReport';
import {
  conference,
  registrationsData as initialPendingRegistrations,
  accountTransfer,
} from '../../../__tests__/fixtures';
import { useAccountTransfers } from './useAccountTransfers';

const getRegistrationData = jest
  .fn()
  .mockResolvedValue(initialPendingRegistrations);
const journalUploadService = {
  getRegistrationData,
} as unknown as JournalUploadService;

describe('useAccountTransfers', () => {
  it('refreshes the transactions', () => {
    const { result } = renderHook(() =>
      useAccountTransfers({
        journalUploadService,
        conference,
        initialPendingRegistrations,
        registrationQueryParams: {} as RegistrationQueryParams,
        report: null,
      }),
    );

    expect(getRegistrationData).not.toHaveBeenCalled();
    result.current.refreshPendingRegistrations();

    expect(getRegistrationData).toHaveBeenCalledTimes(1);
  });

  it('updates when the query params or conference change', () => {
    let query = { filter: 'Name' } as RegistrationQueryParams;
    let currentConference = conference;
    const { rerender } = renderHook(() =>
      useAccountTransfers({
        journalUploadService,
        conference: currentConference,
        initialPendingRegistrations,
        registrationQueryParams: query,
        report: null,
      }),
    );

    expect(getRegistrationData).not.toHaveBeenCalled();

    query = { ...query, filter: 'Name 2' };
    rerender();

    expect(getRegistrationData).toHaveBeenCalledTimes(1);

    currentConference = { ...conference, id: 'conference-2' };
    rerender();

    expect(getRegistrationData).toHaveBeenCalledTimes(2);
  });

  it('loads pending account transfers', () => {
    const { result } = renderHook(() =>
      useAccountTransfers({
        journalUploadService,
        conference,
        initialPendingRegistrations,
        registrationQueryParams: {} as RegistrationQueryParams,
        report: null,
      }),
    );

    expect(result.current).toMatchObject({
      accountTransfers: initialPendingRegistrations.meta.accountTransferEvents,
      metadata: {
        source: 'pending-registrations',
        meta: initialPendingRegistrations.meta,
      },
    });
  });

  it('loads account transfers from report', () => {
    const report: JournalReport = {
      id: 'report-1',
      conferenceId: conference.id,
      accountTransfers: [accountTransfer],
      transactionTimestamp: '',
    };
    const { result } = renderHook(() =>
      useAccountTransfers({
        journalUploadService,
        conference,
        initialPendingRegistrations,
        registrationQueryParams: {} as RegistrationQueryParams,
        report,
      }),
    );

    expect(result.current).toMatchObject({
      accountTransfers: [accountTransfer],
      metadata: {
        source: 'report',
        report,
      },
    });
  });
});
