import { useEffect, useMemo, useState } from 'react';
import { AccountTransfer } from 'accountTransfer';
import { Conference } from 'conference';
import type {
  $filter,
  $http,
  $rootScope,
  $uibModal,
  $window,
  ModalMessage,
  RegistrationQueryParams,
} from 'injectables';
import { JournalReport } from 'journalReport';
import { RegistrationsData } from 'registrations';
import journalUploadReviewModalTemplate from 'views/modals/journalUploadReview.html';
import paymentsModalTemplate from 'views/modals/paymentsModal.html';
import { useAccountTransfers } from '../../hooks/useAccountTransfers';
import { useSelectedItems } from '../../hooks/useSelectedItems';
import { useWatch } from '../../hooks/useWatch';
import { JournalUploadService } from '../../services/journalUploadService';
import {
  JournalTransactionsTable,
  JournalTransactionsTableProps,
} from '../JournalTransactionsTable/JournalTransactionsTable';
import { RegistrationFilters } from '../RegistrationFilters/RegistrationFilters';
import { UploadPageHeader } from '../UploadPageHeader/UploadPageHeader';

interface JournalUploadPageProps {
  $filter: $filter;
  $rootScope: $rootScope;
  $http: $http;
  $window: $window;
  $uibModal: $uibModal;
  journalUploadService: JournalUploadService;
  modalMessage: ModalMessage;
  resolve: {
    registrationsData: RegistrationsData;
    reports: Array<JournalReport>;
    conference: Conference;
    permissions: Permissions;
  };
}

export const JournalUploadPage = ({
  $filter,
  $rootScope,
  $http,
  $window,
  $uibModal,
  journalUploadService,
  modalMessage,
  resolve,
}: JournalUploadPageProps): JSX.Element => {
  const { registrationsData, conference, permissions } = resolve;

  useEffect(() => {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'journal-upload',
      bodyClass: '',
      confId: conference.id,
      footer: true,
    };
  }, [conference.id]);

  const localizedCurrency = (amount: number) =>
    $filter('localizedCurrency')(amount, conference.currency.currencyCode);
  const currencySymbol: string = $filter('localizedSymbol')(
    conference.currency.currencyCode,
  );

  const [reports, setReports] = useState(resolve.reports);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const selectedReport = useMemo(() => {
    if (!currentReportId) {
      return null;
    }

    return reports.find((report) => report.id === currentReportId) ?? null;
  }, [reports, currentReportId]);

  const [queryParameters, setQueryParameters] =
    useState<RegistrationQueryParams>({
      page: 1,
      limit: 20,
      orderBy: 'last_name',
      order: 'ASC',
      filter: '',
      filterAccountTransferErrors: 'yes',
      filterAccountTransfersByExpenseType: '',
      filterAccountTransfersByPaymentType: '',
      filterPayment: '',
      filterRegType: '',
      includeAccountTransfers: true,
      includePromotions: true,
      includeCheckedin: 'yes',
      includeWithdrawn: 'yes',
      includeIncomplete: 'yes',
      primaryRegistrantOnly: true,
    });

  const { accountTransfers, refreshPendingRegistrations, metadata } =
    useAccountTransfers({
      conference,
      initialPendingRegistrations: registrationsData,
      journalUploadService,
      registrationQueryParams: queryParameters,
      report: selectedReport,
    });
  const accountTransfersWithErrors = useMemo(
    () => accountTransfers.filter(({ error }) => error),
    [accountTransfers],
  );
  const accountTransfersWithoutErrors = useMemo(
    () => accountTransfers.filter(({ error }) => !error),
    [accountTransfers],
  );

  const {
    selectedItems: accountTransfersToInclude,
    selectedItemsSet: accountTransfersToIncludeSet,
    allSelected: allTransfersSelected,
    setSelected: setAccountTransferIncluded,
    setManySelected: setManyAccountTransfersIncluded,
    reset: resetSelectedAccountTransfers,
  } = useSelectedItems<AccountTransfer>();
  const allAccountTransfersIncluded = allTransfersSelected(
    accountTransfersWithoutErrors,
  );

  const onQueryParametersChange = (newQueryParams: RegistrationQueryParams) => {
    if (newQueryParams.page !== queryParameters.page) {
      // scroll to top on page change
      $window.scrollTo(0, 0);
    }

    setQueryParameters(newQueryParams);
  };

  useWatch(() => {
    // scroll to top of page if selected report changes
    $window.scrollTo(0, 0);
  }, [currentReportId]);

  useWatch(() => {
    resetSelectedAccountTransfers();
  }, [accountTransfers]);

  const submit = async () => {
    const report = await journalUploadService.submitAccountTransfers([
      ...accountTransfersToInclude,
    ]);

    // Refresh reports list after submitting
    const reports = await journalUploadService.loadAllAccountTransferReports(
      conference.id,
    );
    setReports(reports);
    if (report) {
      viewSubmissionReview(report);
    }
  };

  const viewSubmissionReview = (report: JournalReport) => {
    const clonedQueryParams = { ...queryParameters };
    const journalReviewModalOptions = {
      templateUrl: journalUploadReviewModalTemplate,
      controller: 'journalUploadReviewModal',
      size: 'md',
      backdrop: 'static',
      resolve: {
        conference: () => conference,
        queryParameters: () => clonedQueryParams,
        report: () => report,
      },
    };

    $uibModal.open<string>(journalReviewModalOptions).result.then((data) => {
      // The journal review modal may update the errors filter, so save the changes
      onQueryParametersChange(clonedQueryParams);

      // If data has a value, the user chose to view the report
      if (data) {
        setCurrentReportId(data);
      } else {
        // If not, refresh account transfers
        refreshPendingRegistrations();
      }
    });
  };

  const viewPayments = (registrationId: string) => {
    $http
      .get('registrations/' + registrationId)
      .then((response) => {
        const paymentModalOptions = {
          templateUrl: paymentsModalTemplate,
          controller: 'paymentModal',
          size: 'lg',
          backdrop: 'static',
          resolve: {
            registration: () => response.data,
            // Once EVENT-810 is resolved, we can replace the empty array with the report's registrations
            promotionRegistrationInfoList: () =>
              (metadata.source === 'pending-registrations' &&
                metadata.meta.promotionRegistrationInfoList) ??
              [],
            conference: () => conference,
            permissions: () => permissions,
          },
        };

        $uibModal.open(paymentModalOptions).result.then(() => {
          refreshPendingRegistrations();
        });
      })
      .catch(() => {
        modalMessage.error('Error: registration data could not be retrieved.');
      });
  };

  const commonTransactionTableProps: Omit<
    JournalTransactionsTableProps,
    'accountTransfers' | 'emptyMessage' | 'headerExtra' | 'title'
  > = {
    currencySymbol,
    currentReportId,
    localizedCurrency,

    // Bug: because of current API limitations, we don't have access to the registrations associated with a report
    // Once EVENT-810 is resolved, we can replace the empty array with the report registrations
    registrationsList:
      metadata.source === 'pending-registrations' ? metadata.registrations : [],
    selectable: currentReportId === null,
    selectedTransactions: accountTransfersToIncludeSet,
    setTransactionSelected: setAccountTransferIncluded,
    viewPayments,
  };

  const tables = (
    <>
      {/* Journal Upload Event Transaction Section */}
      {metadata.source === 'pending-registrations' && (
        <div className="row form-group">
          <div className="col-xs-12 details-heading">
            <h4>
              <a href="#">Journal Upload Event Transactions</a>
            </h4>
          </div>
          {accountTransfers.length === 0 ? (
            <div className="col-xs-12">
              <p>
                No transactions have been found to match your filter
                {metadata.meta.totalPages > 1 ? ' on this page' : ''}.
              </p>
            </div>
          ) : (
            <div className="col-xs-12 table-responsive journal-row">
              <table className="table table-aligned">
                <thead>
                  <tr>
                    <th>
                      <a href="#">Expense Type</a>
                    </th>
                    <th />
                    <th />
                    <th>
                      <a href="#">Business Unit</a>
                    </th>
                    <th>
                      <a href="#">Operating Unit</a>
                    </th>
                    <th>
                      <a href="#">Department ID</a>
                    </th>
                    <th>
                      <a href="#">Project ID</a>
                    </th>
                    <th>
                      <a href="#">GL Account</a>
                    </th>
                    <th>
                      <a href="#">Amount</a>
                    </th>
                    <th>
                      <a href="#">Description</a>
                    </th>
                    <th />
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {metadata.meta.accountTransferEvents.map(
                    (transferEvent, index) => (
                      <tr
                        key={transferEvent.expenseType}
                        className={
                          'noselect ' + (index % 2 === 0 ? 'active' : '')
                        }
                      >
                        <th>{transferEvent.expenseType}</th>
                        <td />
                        <td />
                        <td>{transferEvent.businessUnit}</td>
                        <td>{transferEvent.operatingUnit}</td>
                        <td>{transferEvent.departmentId}</td>
                        <td>{transferEvent.projectId}</td>
                        <td>{transferEvent.glAccount}</td>
                        <td>{transferEvent.amount}</td>
                        <td>{transferEvent.description}</td>
                        <td />
                        <td />
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Journal Upload Participant Transaction Error Section */}
      {accountTransfersWithErrors.length > 0 && (
        <JournalTransactionsTable
          {...commonTransactionTableProps}
          accountTransfers={accountTransfersWithErrors}
          title="Journal Upload Participant Transactions With Errors"
          viewPayments={viewPayments}
        />
      )}

      {/* Journal Upload Participant Transaction Section */}
      <JournalTransactionsTable
        {...commonTransactionTableProps}
        accountTransfers={accountTransfersWithoutErrors}
        emptyMessage={
          metadata.source === 'report'
            ? 'No successful account transfers have been found in this report.'
            : `No account transfers have been found to match your filter${
                metadata.meta.totalPages > 1 ? ' on this page' : ''
              }.`
        }
        headerExtra={
          accountTransfersWithoutErrors.length > 0 &&
          !currentReportId && (
            <button
              type="button"
              className="btn btn-default btn-sm"
              onClick={() => {
                setManyAccountTransfersIncluded(
                  accountTransfersWithoutErrors,
                  !allAccountTransfersIncluded,
                );
              }}
            >
              {allAccountTransfersIncluded
                ? 'Remove All From Journal Report'
                : 'Add All To Journal Report'}
            </button>
          )
        }
        title="Journal Upload Participant Transactions"
      />
    </>
  );

  return (
    <div className="container full">
      <UploadPageHeader
        conference={conference}
        currentReportId={currentReportId}
        handleSubmit={() => submit()}
        reports={reports}
        setCurrentReportId={setCurrentReportId}
        submitEnabled={accountTransfersToInclude.length > 0}
        uploadType="Journal"
      />

      {metadata.source === 'pending-registrations' ? (
        <RegistrationFilters
          defaultQueryParams={queryParameters}
          onQueryChange={(query) => onQueryParametersChange(query)}
          conference={conference}
          showPagination={currentReportId === null}
          pageCount={Math.ceil(
            metadata.meta.totalRegistrantsFilter / queryParameters.limit,
          )}
        >
          {tables}
        </RegistrationFilters>
      ) : (
        tables
      )}
    </div>
  );
};
