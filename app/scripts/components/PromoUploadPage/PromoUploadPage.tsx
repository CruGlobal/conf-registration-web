import { groupBy } from 'lodash';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
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
import { Permissions } from 'permissions';
import { PromoRegistration } from 'promoRegistration';
import { PromotionReport } from 'promotionReport';
import { RegistrationsData } from 'registrations';
import journalUploadReviewModalTemplate from 'views/modals/journalUploadReview.html';
import paymentsModalTemplate from 'views/modals/paymentsModal.html';
import { usePromoRegistrationList } from '../../hooks/usePromoRegistrationList';
import { usePromoReport } from '../../hooks/usePromoReport';
import { usePromoReports } from '../../hooks/usePromoReports';
import { useSelectedItems } from '../../hooks/useSelectedItems';
import { useWatch } from '../../hooks/useWatch';
import { JournalUploadService } from '../../services/journalUploadService';
import { PromoReportService } from '../../services/promoReportService';
import {
  PromoTransactionsTable,
  PromoTransactionsTableProps,
} from '../PromoTransactionsTable/PromoTransactionsTable';
import { RegistrationFilters } from '../RegistrationFilters/RegistrationFilters';
import { UploadPageHeader } from '../UploadPageHeader/UploadPageHeader';

export interface PromoUploadPageProps {
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

export const PromoUploadPage: FunctionComponent<PromoUploadPageProps> = ({
  $filter,
  $rootScope,
  $http,
  $window,
  $uibModal,
  journalUploadService,
  promoReportService,
  modalMessage,
  resolve,
}: PromoUploadPageProps) => {
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

  const { promoRegistrations, refreshPendingRegistrations, metadata } =
    usePromoRegistrationList({
      conference,
      initialPendingRegistrations: registrationsData,
      journalUploadService,
      registrationQueryParams: queryParameters,
      report,
    });
  const promoRegistrationsWithErrors = useMemo(
    () => promoRegistrations.filter(({ error }) => error),
    [promoRegistrations],
  );
  const promoRegistrationsWithoutErrors = useMemo(
    () => promoRegistrations.filter(({ error }) => !error),
    [promoRegistrations],
  );

  const {
    selectedItems: registrationsToInclude,
    selectedItemsSet: registrationsToIncludeSet,
    allSelected: allRegistrationsSelected,
    setSelected: setRegistrationIncluded,
    setManySelected: setManyPromosIncluded,
    reset: resetSelectedRegistrations,
  } = useSelectedItems<PromoRegistration>();
  const allRegistrationsIncluded = allRegistrationsSelected(
    promoRegistrationsWithoutErrors,
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

  const submit = async () => {
    // registrationsToInclude will have multiple entries for the same registration if that
    // registration has multiple promo codes, so combine them into one entry per registration
    const registrations = Object.values(
      groupBy(registrationsToInclude, ({ registration }) => registration.id),
    ).map((registrations) => ({
      ...registrations[0].registration,
      promotions: registrations.map(({ promotion }) => promotion),
    }));
    const report = await promoReportService.submitPromos(registrations);

    // Load the new list of reports
    refreshReports();
    if (report) {
      openReviewModal(report);
    }
  };

  const openReviewModal = (report: PromotionReport) => {
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
        // If not, refresh promotion list
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

  const commonTransactionTableProps: Omit<
    PromoTransactionsTableProps,
    'emptyMessage' | 'headerExtra' | 'promoRegistrations' | 'title'
  > = {
    currencySymbol,
    currentReportId,
    localizedCurrency,
    selectable: currentReportId === null,
    viewPayments,
    selectedTransactions: registrationsToIncludeSet,
    setTransactionSelected: setRegistrationIncluded,
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
          {metadata.promoTransactions.length === 0 ? (
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
                      <a href="#">Amount</a>
                    </th>
                    <th>
                      <a href="#">Description</a>
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {metadata.promoTransactions.map(
                    ({ promotion, count }, index) => (
                      <tr
                        key={promotion.id}
                        className={
                          'noselect ' + (index % 2 === 0 ? 'active' : '')
                        }
                      >
                        <th>PROMOTION</th>
                        <td />
                        <td />
                        <td>{conference.businessUnit}</td>
                        <td>{conference.operatingUnit}</td>
                        <td>{conference.department}</td>
                        <td>{conference.projectId}</td>
                        <td>{promotion.amount * count}</td>
                        <td>
                          {conference.abbreviation}-{promotion.code}
                        </td>
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

      {/* Promo Upload Participant Transaction Error Section */}
      {promoRegistrationsWithErrors.length > 0 && (
        <PromoTransactionsTable
          {...commonTransactionTableProps}
          promoRegistrations={promoRegistrationsWithErrors}
          title="Promo Upload Participant Transactions With Errors"
        />
      )}

      {/* Promo Upload Participant Transaction Section */}
      <PromoTransactionsTable
        {...commonTransactionTableProps}
        promoRegistrations={promoRegistrationsWithoutErrors}
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
                  promoRegistrationsWithoutErrors,
                  !allRegistrationsIncluded,
                );
              }}
            >
              {allRegistrationsIncluded
                ? 'Remove All From Promo Report'
                : 'Add All To Promo Report'}
            </button>
          )
        }
        title="Promo Upload Participant Transactions"
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
        submitEnabled={registrationsToInclude.length > 0}
        uploadType="Promo"
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
