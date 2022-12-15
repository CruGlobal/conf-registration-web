import angular from 'angular';
import { find } from 'lodash';
import { Conference } from 'conference';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { react2angular } from 'react2angular';
import { RegistrationFilters } from '../RegistrationFilters/RegistrationFilters';
import { JournalTransactionsTable } from '../JournalTransactionsTable/JournalTransactionsTable';
import journalUploadReviewModalTemplate from 'views/modals/journalUploadReview.html';
import paymentsModalTemplate from 'views/modals/paymentsModal.html';
import type {
  $filter,
  $http,
  $rootScope,
  $uibModal,
  $window,
  RegistrationQueryParams,
  JournalUploadService,
  ModalMessage,
} from 'injectables';
import { RegistrationsData } from 'registrations';
import { Report } from 'report';
import { useAccountTransfers } from '../../hooks/useAccountTransfers';
import { useSelectedItems } from '../../hooks/useSelectedItems';
import { AccountTransfer } from 'accountTransfer';
import { useWatch } from '../../hooks/useWatch';

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
    reports: Array<Report>;
    conference: Conference;
    permissions: Permissions;
  };
}

const JournalUploadPage = ({
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

  const {
    accountTransfers,
    accountTransfersWithErrors,
    registrations,
    meta,
    loadConferenceRegistrations: refreshRegistrations,
    loadReportRegistrations,
  } = useAccountTransfers({
    journalUploadService,
    initialRegistrationsData: registrationsData,
  });

  const [reports, setReports] = useState(resolve.reports);
  const [currentReportId, setCurrentReportId] = useState('');
  const {
    selectedItems: accountTransfersToInclude,
    selectedItemsSet: accountTransfersToIncludeSet,
    allSelected: allTransfersSelected,
    setSelected: setAccountTransferIncluded,
    setManySelected: setManyAccountTransfersIncluded,
    reset: removeAllTransfersFromToInclude,
  } = useSelectedItems<AccountTransfer>();
  const allAccountTransfersIncluded = allTransfersSelected(accountTransfers);
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

  const onQueryParametersChange = (newQueryParams: RegistrationQueryParams) => {
    if (newQueryParams.page !== queryParameters.page) {
      // scroll to top on page change
      $window.scrollTo(0, 0);
    }

    setQueryParameters(newQueryParams);
  };

  useWatch(() => {
    // Refresh the data whenever the query parameters change
    refresh();
  }, [queryParameters]);

  useWatch(() => {
    // scroll to top of page if selected report changes
    $window.scrollTo(0, 0);

    // if currentReportId is blank, refresh account transfer data
    if (!currentReportId) {
      refresh();
    } else {
      const report = reports.find((report) => report.id === currentReportId);
      if (!report) {
        throw new Error(`No report exists with id "${currentReportId}"`);
      }
      loadReportRegistrations(report);
    }
  }, [currentReportId]);

  const refresh = () => {
    refreshRegistrations(conference.id, queryParameters).then(() => {
      removeAllTransfersFromToInclude();
    });
  };

  const getRemainingBalance = (registrationId: string): number => {
    return (
      find(registrations, {
        id: registrationId,
      })?.remainingBalance ?? 0
    );
  };

  const submit = () => {
    journalUploadService
      .submitAccountTransfers([...accountTransfersToInclude])
      .then((report) => {
        // Refresh reports list after submitting
        journalUploadService
          .getAllAccountTransferReports(conference.id)
          .then((reports) => {
            setReports(reports);
          });
        viewSubmissionReview(report);
      });
  };

  const viewSubmissionReview = (report: Report) => {
    const clonedQueryParams = Object.assign(queryParameters);
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
        refresh();
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
            promotionRegistrationInfoList: () =>
              meta?.promotionRegistrationInfoList ?? [],
            conference: () => conference,
            permissions: () => permissions,
          },
        };

        $uibModal.open(paymentModalOptions).result.then(() => {
          refresh();
        });
      })
      .catch(() => {
        modalMessage.error('Error: registration data could not be retrieved.');
      });
  };

  return (
    <div className="container full">
      <div className="row form-group">
        <div className="col-sm-7">
          <h2 className="page-title">ERT Journal Upload Submission</h2>
        </div>
        <div className="col-sm-5 text-right">
          <button
            className="btn btn-success btn-md"
            type="button"
            onClick={() => submit()}
            disabled={accountTransfersToInclude.length === 0}
          >
            Submit Journal Upload
          </button>
        </div>
      </div>
      <div className="row form-group">
        <div className="col-xs-6 col-sm-2 details-heading">
          Conference Long Name:
        </div>
        <div className="col-xs-6 col-sm-3 details-heading">
          {conference.name}
        </div>
      </div>
      <div className="row form-group">
        <div className="col-xs-6 col-sm-2 details-heading">Conference ID:</div>
        <div className="col-xs-6 col-sm-3 details-heading">{conference.id}</div>
      </div>
      <div className="row form-group">
        <div className="col-xs-6 col-sm-2 details-heading">
          Conference Contact:
        </div>
        <div className="col-xs-6 col-sm-3 details-heading">
          {conference.contactPersonName}, {conference.contactPersonPhone},{' '}
          {conference.contactPersonEmail}
        </div>
      </div>
      <div className="row form-group">
        <div className="col-xs-6 col-sm-2 details-heading">
          <label htmlFor="report-select-id">Report creation date: </label>
        </div>
        <div className="col-xs-6 col-sm-3 details-heading">
          <select
            className="form-control"
            id="report-select-id"
            value={currentReportId}
            onChange={(event) => setCurrentReportId(event.target.value)}
          >
            <option value="">New Report</option>
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.transactionTimestamp}
              </option>
            ))}
          </select>
        </div>
      </div>

      <RegistrationFilters
        defaultQueryParams={queryParameters}
        onQueryChange={(query) => onQueryParametersChange(query)}
        showPagination={!currentReportId}
        pageCount={Math.ceil(
          (meta?.totalRegistrantsFilter ?? 0) / queryParameters.limit,
        )}
      >
        {/* Journal Upload Event Transaction Section */}
        {!currentReportId && meta && (
          <div className="row form-group">
            <div className="col-xs-12 details-heading">
              <h4>
                <a href="#">Journal Upload Event Transactions</a>
              </h4>
            </div>
            {meta.accountTransferEvents.length === 0 && (
              <div className="col-xs-12">
                <p>
                  No transactions have been found to match your filter
                  {meta.totalPages > 1 ? ' on this page' : ''}.
                </p>
              </div>
            )}
            {meta.accountTransferEvents.length > 0 && (
              <div className="col-xs-12 table-responsive journal-row">
                <table className="table table-aligned">
                  <thead>
                    <tr>
                      <th>
                        <a href="#">Expense Type</a>
                      </th>
                      <th></th>
                      <th></th>
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
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {meta.accountTransferEvents.map((r, index) => (
                      <tr
                        key={r.id}
                        className={classNames('noselect', {
                          active: index % 2 === 0,
                        })}
                      >
                        <th>{r.expenseType}</th>
                        <td></td>
                        <td></td>
                        <td>{r.businessUnit}</td>
                        <td>{r.operatingUnit}</td>
                        <td>{r.departmentId}</td>
                        <td>{r.projectId}</td>
                        <td>{r.glAccount}</td>
                        <td>{r.amount}</td>
                        <td>{r.description}</td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Journal Upload Participant Transaction Error Section */}
        {accountTransfersWithErrors.length > 0 && (
          <div className="row form-group">
            <JournalTransactionsTable
              accountTransfers={accountTransfersWithErrors}
              currencySymbol={currencySymbol}
              currentReportId={currentReportId}
              getRemainingBalance={getRemainingBalance}
              localizedCurrency={localizedCurrency}
              selectedAccountTransfers={accountTransfersToIncludeSet}
              setAccountTransferSelected={setAccountTransferIncluded}
              title="Journal Upload Participant Transactions With Errors"
              viewPayments={viewPayments}
            />
          </div>
        )}

        {/* Journal Upload Participant Transactions Section */}
        <div className="row form-group">
          <JournalTransactionsTable
            accountTransfers={accountTransfers}
            currencySymbol={currencySymbol}
            currentReportId={currentReportId}
            emptyMessage={
              currentReportId
                ? 'No successful account transfers have been found in this report.'
                : `No account transfers have been found to match your filter${
                    meta?.totalPages ?? 0 > 1 ? ' on this page' : ''
                  }.`
            }
            getRemainingBalance={getRemainingBalance}
            headerExtra={
              accountTransfers.length > 0 &&
              !currentReportId && (
                <button
                  type="button"
                  className="btn btn-default btn-sm"
                  onClick={() => {
                    setManyAccountTransfersIncluded(
                      accountTransfers,
                      !allAccountTransfersIncluded,
                    );
                  }}
                >
                  {allAccountTransfersIncluded
                    ? 'Remove All from Journal Report'
                    : 'Add All To Journal Report'}
                </button>
              )
            }
            localizedCurrency={localizedCurrency}
            selectedAccountTransfers={accountTransfersToIncludeSet}
            setAccountTransferSelected={setAccountTransferIncluded}
            title="Journal Upload Participant Transactions"
            viewPayments={viewPayments}
          />
        </div>
      </RegistrationFilters>
    </div>
  );
};

angular
  .module('confRegistrationWebApp')
  .component(
    'journalUploadPage',
    react2angular(
      JournalUploadPage,
      ['resolve'],
      [
        '$filter',
        '$rootScope',
        '$http',
        '$window',
        '$uibModal',
        'journalUploadService',
        'modalMessage',
      ],
    ),
  );
