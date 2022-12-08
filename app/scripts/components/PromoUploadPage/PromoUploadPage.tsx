import angular from 'angular';
import { find, map } from 'lodash';
import { Conference } from 'conference';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { react2angular } from 'react2angular';
import { JournalFilters } from '../JournalFilters/JournalFilters';
import journalUploadReviewModalTemplate from 'views/modals/journalUploadReview.html';
import paymentsModalTemplate from 'views/modals/paymentsModal.html';
import type {
  $filter,
  $http,
  $rootScope,
  $uibModal,
  $window,
  JournalQueryParams,
  JournalUploadService,
  ModalMessage,
} from 'injectables';
import { RegistrationsData } from 'registrations';
import { Report } from 'report';
import { usePromoRegistrationList } from '../../hooks/usePromoRegistrationList';
import { useSelectedItems } from '../../hooks/useSelectedItems';
import { PromoTransactionsTable } from '../PromoTransactionsTable/PromoTransactionsTable';
import { useWatch } from '../../hooks/useWatch';
import { PromoReportService } from '../../services/promoReportService';
import { Registration } from 'registration';
import { PromotionReport } from 'promotionReport';

interface PromoUploadPageProps {
  $filter: $filter;
  $rootScope: $rootScope;
  $http: $http;
  $window: $window;
  $uibModal: $uibModal;
  journalUploadService: JournalUploadService;
  promoReportService: PromoReportService;
  modalMessage: ModalMessage;
  resolve: {
    registrationsData: RegistrationsData;
    reports: Array<Report>;
    conference: Conference;
    permissions: Permissions;
  };
}

const PromoUploadPage = ({
  $filter,
  $rootScope,
  $http,
  $window,
  $uibModal,
  journalUploadService,
  promoReportService,
  modalMessage,
  resolve,
}: PromoUploadPageProps): JSX.Element => {
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
    allPromoRegistrations,
    promoRegistrationsWithoutErrors,
    promoRegistrationsWithErrors,
    promoTransactions,
    meta,
    registrations,
    loadFromUnposted: refreshRegistrations,
    loadFromReport: loadReportPromoRegistrations,
  } = usePromoRegistrationList({
    journalUploadService,
    conference,
    initialRegistrationsData: registrationsData,
  });

  const [reports, setReports] = useState<Array<PromotionReport>>([]);
  const [currentReportId, setCurrentReportId] = useState('');
  const {
    selectedItems: registrationsToInclude,
    selectedItemsSet: registrationsToIncludeSet,
    allSelected: allRegistrationsSelected,
    setSelected: setRegistrationIncluded,
    setManySelected: setManyPromosIncluded,
    reset: resetSelectedRegistrations,
  } = useSelectedItems<Registration>();
  const allRegistrationsIncluded = allRegistrationsSelected(
    map(allPromoRegistrations, 'registration'),
  );
  const [queryParameters, setQueryParameters] = useState<JournalQueryParams>({
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
    includeCheckedin: 'yes',
    includeWithdrawn: 'yes',
    includeIncomplete: 'yes',
    primaryRegistrantOnly: true,
  });

  function onQueryParametersChange(newQueryParams: JournalQueryParams) {
    if (newQueryParams.page !== queryParameters.page) {
      // scroll to top on page change
      $window.scrollTo(0, 0);
    }

    setQueryParameters(newQueryParams);
  }

  // Load the initial list of reports
  useEffect(() => {
    promoReportService.loadAllPromoReports(conference.id).then((reports) => {
      setReports(reports);
    });
  }, []);

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
      loadReportPromoRegistrations(report);
    }
  }, [currentReportId]);

  const refresh = () => {
    refreshRegistrations(conference.id, queryParameters).then(() => {
      resetSelectedRegistrations();
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
    promoReportService
      .submitPromos([...registrationsToInclude])
      .then((report) => {
        // Refresh reports list after submitting
        promoReportService
          .loadAllPromoReports(conference.id)
          .then((reports) => {
            setReports(reports);
          });

        if (report) {
          viewSubmissionReview(report);
        }
      });
  };

  const viewSubmissionReview = (report: PromotionReport) => {
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
        // If not, refresh promotion list
        setCurrentReportId('');
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
          <h2 className="page-title">ERT Promo Upload Submission</h2>
        </div>
        <div className="col-sm-5 text-right">
          <button
            className="btn btn-success btn-md"
            type="button"
            onClick={() => submit()}
            disabled={registrationsToInclude.length === 0}
          >
            Submit Promo Upload
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

      <JournalFilters
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
                <a href="#">Promo Upload Event Transactions</a>
              </h4>
            </div>
            {promoTransactions.length === 0 ? (
              <div className="col-xs-12">
                <p>
                  No transactions have been found to match your filter
                  {meta.totalPages > 1 ? ' on this page' : ''}.
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
                    {promoTransactions.map(({ promotion, count }, index) => (
                      <tr
                        key={promotion.id}
                        className={classNames('noselect', {
                          active: index % 2 === 0,
                        })}
                      >
                        <th>PROMOTION</th>
                        <td></td>
                        <td></td>
                        <td>{promotion.businessUnit}</td>
                        <td>{promotion.operatingUnit}</td>
                        <td>{promotion.departmentId}</td>
                        <td>{promotion.projectId}</td>
                        <td>41300</td>
                        <td>{promotion.amount * count}</td>
                        <td>{promotion.code}</td>
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

        {/* Promo Upload Participant Transaction Error Section */}
        {promoRegistrationsWithErrors.length > 0 && (
          <div className="row form-group">
            <PromoTransactionsTable
              promoRegistrations={promoRegistrationsWithErrors.filter((item) =>
                currentReportId
                  ? item.successfullyPosted
                  : !item.successfullyPosted,
              )}
              currencySymbol={currencySymbol}
              currentReportId={currentReportId}
              getRemainingBalance={getRemainingBalance}
              localizedCurrency={localizedCurrency}
              selectedRegistrants={registrationsToIncludeSet}
              setRegistrationSelected={setRegistrationIncluded}
              title="Promo Upload Participant Transactions With Errors"
              viewPayments={viewPayments}
            />
          </div>
        )}

        {/* Promo Upload Participant Transaction Section */}
        <div className="row form-group">
          <PromoTransactionsTable
            promoRegistrations={promoRegistrationsWithoutErrors.filter((item) =>
              currentReportId
                ? item.successfullyPosted
                : !item.successfullyPosted,
            )}
            currencySymbol={currencySymbol}
            currentReportId={currentReportId}
            emptyMessage={
              currentReportId
                ? 'No successful promotion transfers have been found in this report.'
                : `No promotion transfers have been found to match your filter${
                    meta.totalPages > 1 ? ' on this page' : ''
                  }.`
            }
            getRemainingBalance={getRemainingBalance}
            headerExtra={
              registrations.length > 0 &&
              !currentReportId && (
                <button
                  type="button"
                  className="btn btn-default btn-sm"
                  onClick={() => {
                    setManyPromosIncluded(
                      registrations,
                      !allRegistrationsIncluded,
                    );
                  }}
                >
                  {allRegistrationsIncluded
                    ? 'Remove All from Promo Report'
                    : 'Add All To Promo Report'}
                </button>
              )
            }
            localizedCurrency={localizedCurrency}
            selectedRegistrants={registrationsToIncludeSet}
            setRegistrationSelected={setRegistrationIncluded}
            title="Promos Upload Participant Transactions"
            viewPayments={viewPayments}
          />
        </div>
      </JournalFilters>
    </div>
  );
};

angular
  .module('confRegistrationWebApp')
  .component(
    'promoUploadPage',
    react2angular(
      PromoUploadPage,
      ['resolve'],
      [
        '$filter',
        '$rootScope',
        '$http',
        '$window',
        '$uibModal',
        'journalUploadService',
        'promoReportService',
        'modalMessage',
      ],
    ),
  );
