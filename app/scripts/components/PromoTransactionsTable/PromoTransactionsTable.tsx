import { PromoRegistration } from '../../hooks/usePromoRegistrationList';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { RegistrationsPaidPopover } from '../RegistrationsPaidPopover/RegistrationsPaidPopover';

export interface PromoTransactionsTableProps {
  // The promo registrations to display
  promoRegistrations: Array<PromoRegistration>;

  // The id of the report that is currently being viewed, if any
  currentReportId: string | null;

  // The localized currency symbol
  currencySymbol: string;

  // Message to display when there aren't any promo transactions
  emptyMessage?: string;

  // Extra content to display in the table header
  headerExtra?: React.ReactFragment;

  // Convert a currency amount to a localized string
  localizedCurrency: (amount: number) => string;

  // The set of registrations that are selected and will be included in a new report
  selectedRegistrations: Set<PromoRegistration>;

  // Handle changes to the selected state of a promo transaction
  setRegistrationSelected: (
    promoRegistration: PromoRegistration,
    selected: boolean,
  ) => void;

  // The title of the transactions table
  title: string;

  // Open the view payments modal
  viewPayments: (registrationId: string) => void;
}

export const PromoTransactionsTable = ({
  promoRegistrations,
  currentReportId,
  currencySymbol,
  emptyMessage,
  headerExtra,
  localizedCurrency,
  selectedRegistrations,
  setRegistrationSelected,
  title,
  viewPayments,
}: PromoTransactionsTableProps): JSX.Element => {
  const getBalanceClassName = (balance: number): string => {
    if (balance === 0) {
      return 'btn-success';
    } else if (balance < 0) {
      return 'btn-danger';
    } else {
      return 'btn-default';
    }
  };

  const rows = useMemo(
    () =>
      // Expand each registration item into one row per registrant in the registration
      promoRegistrations.flatMap((promoRegistration) =>
        promoRegistration.registration.groupRegistrants
          // If the promotion doesn't apply to all registrations, filter out the non-primary registrants
          .filter(
            (registrant) =>
              promoRegistration.promotion.applyToAllRegistrants ||
              registrant.id ===
                promoRegistration.registration.primaryRegistrantId,
          )
          .map((registrant) => ({
            id: `${registrant.id}|${promoRegistration.promotion.id}`,
            promoRegistration,
            registrant,
            ...promoRegistration,
          })),
      ),
    [promoRegistrations],
  );

  return (
    <>
      <div>
        <div className="col-xs-6 details-heading">
          <h4>
            <a href="#">{title}</a>
          </h4>
        </div>
        <div className="col-xs-6 text-right">{headerExtra}</div>
        {rows.length === 0 && <div className="col-xs-12">{emptyMessage}</div>}
      </div>
      <div className="col-xs-12 table-responsive journal-row">
        <table className="table table-aligned">
          <thead>
            <tr>
              <th>
                <a href="#">First Name</a>
              </th>
              <th>
                <a href="#">Last Name</a>
              </th>
              <th>
                Paid{' '}
                <OverlayTrigger
                  trigger={['hover', 'focus']}
                  placement="top"
                  overlay={
                    <Popover id="PromoTransactionsTablePaidPopover">
                      <RegistrationsPaidPopover />
                    </Popover>
                  }
                >
                  <i className="fa fa-question-circle" />
                </OverlayTrigger>
              </th>
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
              <th className="text-center">
                <a href="#">Description</a>
              </th>
              {!currentReportId && (
                <th className="text-center">
                  <a href="#">Include into report</a>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map(
              (
                {
                  id,
                  promoRegistration,
                  registration,
                  registrant,
                  promotion,
                  error,
                },
                index,
              ) => (
                <tr
                  key={id}
                  className={classNames('noselect', {
                    active: index % 2 === 0,
                  })}
                >
                  <td>{registrant.firstName}</td>
                  <td>{registrant.lastName}</td>
                  <td>
                    <button
                      type="button"
                      className={classNames([
                        'btn btn-sm btn-bold text-center',
                        getBalanceClassName(registration.remainingBalance),
                      ])}
                      title="View/Edit Payments &amp; Expenses"
                      onClick={() => viewPayments(registrant.registrationId)}
                    >
                      <span className="currency-label">{currencySymbol}</span>
                    </button>
                    {error && (
                      <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="top"
                        overlay={
                          <Popover id="PromoTransactionsTableErrorPopover">
                            {error}
                          </Popover>
                        }
                      >
                        <i className="error-popover fa fa-exclamation-triangle" />
                      </OverlayTrigger>
                    )}
                  </td>
                  <td>{promotion.businessUnit}</td>
                  <td>{promotion.operatingUnit}</td>
                  <td>{promotion.departmentId}</td>
                  <td>{promotion.projectId}</td>
                  <td>{localizedCurrency(promotion.amount)}</td>
                  <td className="text-center">
                    {promotion.code} {registrant.lastName},{' '}
                    {registrant.firstName}
                  </td>
                  <td className="text-center">
                    {!currentReportId && (
                      <input
                        type="checkbox"
                        checked={selectedRegistrations.has(promoRegistration)}
                        onChange={(event) =>
                          setRegistrationSelected(
                            promoRegistration,
                            event.target.checked,
                          )
                        }
                      />
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
