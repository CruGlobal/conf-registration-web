import angular from 'angular';
import { groupBy } from 'lodash';
import { Conference } from 'conference';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { react2angular } from 'react2angular';
import { RegistrationFilters } from '../RegistrationFilters/RegistrationFilters';
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
import {
  PromoRegistration,
  usePromoRegistrationList,
} from '../../hooks/usePromoRegistrationList';
import { usePromoReport } from '../../hooks/usePromoReport';
import { usePromoReports } from '../../hooks/usePromoReports';
import { useSelectedItems } from '../../hooks/useSelectedItems';
import { PromoTransactionsTable } from '../PromoTransactionsTable/PromoTransactionsTable';
import { useWatch } from '../../hooks/useWatch';
import { PromoReportService } from '../../services/promoReportService';
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

  const { reports, refresh: refreshReports } = usePromoReports({
    conferenceId: conference.id,
    promoReportService,
  });
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const { report, refresh: refreshReport } = usePromoReport({
    conference: conference,
    reportId: currentReportId,
    promoReportService,
  });

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
      includeAccountTransfers: false,
      includePromotions: true,
      includeCheckedin: 'only',
      includeWithdrawn: 'no',
      includeIncomplete: 'no',
      primaryRegistrantOnly: false,
    });

  const {
    promoRegistrations,
    promoTransactions,
    refreshPendingRegistrations,
    metadata,
  } = usePromoRegistrationList({
    journalUploadService,
    conference,
    initialPendingRegistrations: registrationsData,
    registrationQueryParams: queryParameters,
    report,
  });

  const {
    selectedItems: registrationsToInclude,
    selectedItemsSet: registrationsToIncludeSet,
    allSelected: allRegistrationsSelected,
    setSelected: setRegistrationIncluded,
    setManySelected: setManyPromosIncluded,
    reset: resetSelectedRegistrations,
  } = useSelectedItems<PromoRegistration>();
  const allRegistrationsIncluded = allRegistrationsSelected(promoRegistrations);

  const promoRegistrationsWithErrors = promoRegistrations.filter(
    (item) => item.error,
  );
  const promoRegistrationsWithoutErrors = promoRegistrations.filter(
    (item) => !item.error,
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
    resetSelectedRegistrations();
  }, [promoRegistrations]);

  const submit = () => {
    // registrationsToInclude will have multiple entries for the same registration if that
    // registration has multiple promo codes, so combine them into one entry per registration
    const registrations = Object.values(
      groupBy(registrationsToInclude, ({ registration }) => registration.id),
    ).map((registrations) => ({
      ...registrations[0].registration,
      promotions: registrations.map(({ promotion }) => promotion),
    }));
    promoReportService.submitPromos(registrations).then((report) => {
      // Load the new list of reports
      refreshReports();
      refreshPendingRegistrations();

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
        setCurrentReportId(null);
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
              metadata.source === 'report'
                ? metadata.report.promotionRegistrationInfoList
                : metadata.meta.promotionRegistrationInfoList ?? [],
            conference: () => conference,
            permissions: () => permissions,
          },
        };

        $uibModal.open(paymentModalOptions).result.then(() => {
          if (metadata.source === 'report') {
            refreshReport();
          } else {
            refreshPendingRegistrations();
          }
        });
      })
      .catch(() => {
        modalMessage.error('Error: registration data could not be retrieved.');
      });
  };

  const tables = (
    <>
      {/* Journal Upload Event Transaction Section */}
      {metadata.source === 'pending-registrations' && (
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
                      <a href="#">Amount</a>
                    </th>
                    <th>
                      <a href="#">Description</a>
                    </th>
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
                      <td>{conference.businessUnit}</td>
                      <td>{conference.operatingUnit}</td>
                      <td>{conference.department}</td>
                      <td>{conference.projectId}</td>
                      <td>{promotion.amount * count}</td>
                      <td>{promotion.code}</td>
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
            promoRegistrations={promoRegistrationsWithErrors}
            currencySymbol={currencySymbol}
            currentReportId={currentReportId}
            localizedCurrency={localizedCurrency}
            selectedRegistrations={registrationsToIncludeSet}
            setRegistrationSelected={setRegistrationIncluded}
            title="Promo Upload Participant Transactions With Errors"
            viewPayments={viewPayments}
          />
        </div>
      )}

      {/* Promo Upload Participant Transaction Section */}
      <div className="row form-group">
        <PromoTransactionsTable
          promoRegistrations={promoRegistrationsWithoutErrors}
          currencySymbol={currencySymbol}
          currentReportId={currentReportId}
          emptyMessage={
            metadata.source === 'report'
              ? 'No successful promotion transfers have been found in this report.'
              : `No promotion transfers have been found to match your filter${
                  metadata.meta.totalPages > 1 ? ' on this page' : ''
                }.`
          }
          headerExtra={
            promoRegistrationsWithoutErrors.length > 0 &&
            !currentReportId && (
              <button
                type="button"
                className="btn btn-default btn-sm"
                onClick={() => {
                  setManyPromosIncluded(
                    promoRegistrations,
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
          selectedRegistrations={registrationsToIncludeSet}
          setRegistrationSelected={setRegistrationIncluded}
          title="Promos Upload Participant Transactions"
          viewPayments={viewPayments}
        />
      </div>
    </>
  );

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
          {[
            conference.contactPersonName,
            conference.contactPersonPhone,
            conference.contactPersonEmail,
          ].join(', ')}
        </div>
      </div>
      <div className="row form-group">
        <div className="col-xs-6 col-sm-2 details-heading">
          <label htmlFor="report-select-id">Report creation date:</label>
        </div>
        <div className="col-xs-6 col-sm-3 details-heading">
          <select
            className="form-control"
            id="report-select-id"
            value={currentReportId ?? ''}
            onChange={(event) => setCurrentReportId(event.target.value || null)}
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

      {currentReportId === null ? (
        <RegistrationFilters
          defaultQueryParams={queryParameters}
          onQueryChange={(query) => onQueryParametersChange(query)}
          conference={conference}
          showPagination={currentReportId === null}
          pageCount={Math.ceil(
            (metadata.source === 'pending-registrations'
              ? metadata.meta.totalRegistrantsFilter
              : 0) / queryParameters.limit,
          )}
          hiddenFilters={[
            'filterPayment',
            'filterAccountTransfersByExpenseType',
            'filterAccountTransfersByPaymentType',
            'filterAccountTransferErrors',
          ]}
        >
          {tables}
        </RegistrationFilters>
      ) : (
        tables
      )}
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
