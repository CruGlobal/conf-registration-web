import { AccountTransfer } from 'accountTransfer';
import { RegistrationQueryParams, JournalUploadService } from 'injectables';
import { partition } from 'lodash';
import { useState } from 'react';
import { RegistrationsData } from 'registrations';
import { Report } from 'report';

// This hook provides access to account transfers, categorized by whether they have errors or not,
// from either a report or the registrations in a conference that haven't been submitted yet.
// When creating the hook, `initialRegistrationsData` is passed in, and the account transfers are
// sourced from that registrations data. `loadConferenceRegistrations` can be called to update
// the account transfers information with fresh data from the server. Initially and after calls to
// `loadConferenceRegistrations`, `registrations` and `meta` will both be set.
// `loadReportRegistrations` can be called to synchronously populate the account transfers with
// data from the provided report. After calls to `loadReportRegistrations`, `registrations` and
// `meta` will both be null until `loadConferenceRegistrations` is called again because they
// are meaningless in the context of a report.
export const useAccountTransfers = ({
  journalUploadService,
  initialRegistrationsData,
}: {
  journalUploadService: JournalUploadService;
  initialRegistrationsData: RegistrationsData;
}): {
  accountTransfers: Array<AccountTransfer>;
  accountTransfersWithErrors: Array<AccountTransfer>;

  // registrations and meta will be null if the transfers source is a report, i.e. if
  // loadReportRegistrations was called more recently than loadConferenceRegistrations
  registrations: RegistrationsData['registrations'] | null;
  meta: RegistrationsData['meta'] | null;

  // Update the transfers with fresh registrations data from the server
  loadConferenceRegistrations(
    conferenceId: string,
    queryParameters: RegistrationQueryParams,
  ): Promise<void>;

  // Update the transfers with registrations data from a report
  loadReportRegistrations(report: Report): void;
} => {
  const [registrationsData, setRegistrationsData] =
    useState<RegistrationsData | null>(initialRegistrationsData);

  const [accountTransfers, setAccountTransfers] = useState(
    journalUploadService.getAccountTransferData(initialRegistrationsData),
  );
  const [accountTransfersWithErrors, setAccountTransfersWithErrors] = useState(
    journalUploadService.getAccountTransferDataWithErrors(
      initialRegistrationsData,
    ),
  );

  const loadConferenceRegistrations = async (
    conferenceId: string,
    queryParameters: RegistrationQueryParams,
  ) => {
    const registrationsData = await journalUploadService.getRegistrationData(
      conferenceId,
      queryParameters,
    );
    setRegistrationsData(registrationsData);
    setAccountTransfers(
      journalUploadService.getAccountTransferData(registrationsData),
    );
    setAccountTransfersWithErrors(
      journalUploadService.getAccountTransferDataWithErrors(registrationsData),
    );
  };

  const loadReportRegistrations = (report: Report) => {
    const [errors, nonErrors] = partition(
      report.accountTransfers,
      (accountTransfer) => accountTransfer.error,
    );
    setAccountTransfers(nonErrors);
    setAccountTransfersWithErrors(errors);
    setRegistrationsData(null);
  };

  return {
    accountTransfers,
    accountTransfersWithErrors,
    registrations: registrationsData?.registrations ?? null,
    meta: registrationsData?.meta ?? null,
    loadConferenceRegistrations,
    loadReportRegistrations,
  };
};
