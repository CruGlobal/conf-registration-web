import { useMemo, useState } from 'react';
import { AccountTransfer } from 'accountTransfer';
import { Conference } from 'conference';
import { RegistrationQueryParams } from 'injectables';
import { JournalUploadService } from '../services/journalUploadService';
import { JournalReport } from 'journalReport';
import { RegistrationsData } from 'registrations';
import { useWatch } from './useWatch';

// This hook provides access to account transfers. The source for the account transfers can be
// a report by passing in a non-null report. Alternatively, if the report is null, the source will be
// pending registrations found using the provided registration query params.
export const useAccountTransfers = ({
  conference,
  journalUploadService,
  initialPendingRegistrations,
  registrationQueryParams,
  report,
}: {
  conference: Conference;
  initialPendingRegistrations: RegistrationsData;
  journalUploadService: JournalUploadService;
  registrationQueryParams: RegistrationQueryParams;
  report: JournalReport | null;
}): {
  // An array of the account transfers for the report or the pending registrations list
  accountTransfers: Array<AccountTransfer>;

  // Holds additional data, depending on the source of the account transfers
  metadata:
    | {
        source: 'report';
        report: JournalReport;
      }
    | {
        source: 'pending-registrations';
        meta: RegistrationsData['meta'];
        registrations: RegistrationsData['registrations'];
      };

  // Reload the pending registrations with fresh data from the server
  refreshPendingRegistrations: () => void;
} => {
  const [pendingRegistrations, setPendingRegistrations] =
    useState<RegistrationsData>(initialPendingRegistrations);

  // Calculate the list of unposted account transfers from the current page of registrations
  const pendingAccountTransfers = useMemo(
    () =>
      pendingRegistrations.registrations.flatMap(
        (registration) => registration.accountTransfers,
      ),
    [pendingRegistrations],
  );

  const refreshPendingRegistrations = () => {
    journalUploadService
      .getRegistrationData(conference.id, registrationQueryParams)
      .then((pendingRegistrations) => {
        setPendingRegistrations(pendingRegistrations);
      });
  };

  // Reload the registrations whenever the query params or the conference changes
  useWatch(() => {
    // If the account transfers are sourced from a report, there is no need to refresh the registrations data
    if (!report) {
      refreshPendingRegistrations();
    }
  }, [conference, registrationQueryParams, report]);

  return {
    refreshPendingRegistrations,
    ...(report
      ? {
          accountTransfers: report.accountTransfers,
          metadata: {
            source: 'report',
            report,
          },
        }
      : {
          accountTransfers: pendingAccountTransfers,
          metadata: {
            source: 'pending-registrations',
            meta: pendingRegistrations.meta,
            registrations: pendingRegistrations.registrations,
          },
        }),
  };
};
