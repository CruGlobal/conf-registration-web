import { AccountTransfer } from 'accountTransfer';
import classNames from 'classnames';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { RegistrationsPaidPopover } from '../RegistrationsPaidPopover/RegistrationsPaidPopover';

export interface JournalTransactionsTableProps {
  // The account transfers to display
  accountTransfers: Array<AccountTransfer>;

  // The id of the report that is currently being viewed, if any
  currentReportId: string | null;

  // The localized currency symbol
  currencySymbol: string;

  // Message to display when there aren't any account transfers
  emptyMessage?: string;

  // Lookup the remaining balance of a registration
  getRemainingBalance: (registrationId: string) => number;

  // Extra content to display in the table header
  headerExtra?: React.ReactFragment;

  // Convert a currency amount to a localized string
  localizedCurrency: (amount: number) => string;

  // The set of account transfers that are selected and will be included in a new report
  selectedAccountTransfers: Set<AccountTransfer>;

  // Handle changes to the selected state of an account transfer
  setAccountTransferSelected: (
    accountTransfer: AccountTransfer,
    selected: boolean,
  ) => void;

  // The title of the transactions table
  title: string;

  // Open the view payments modal
  viewPayments: (registrationId: string) => void;
}

export const JournalTransactionsTable = ({
  accountTransfers,
  currentReportId,
  currencySymbol,
  emptyMessage,
  headerExtra,
  getRemainingBalance,
  localizedCurrency,
  selectedAccountTransfers,
  setAccountTransferSelected,
  title,
  viewPayments,
}: JournalTransactionsTableProps): JSX.Element => {
  const getBalanceClassName = (balance: number): string => {
    if (balance === 0) {
      return 'btn-success';
    } else if (balance < 0) {
      return 'btn-danger';
    } else {
      return 'btn-default';
    }
  };

  return (
    <>
      <div>
        <div className="col-xs-6 details-heading">
          <h4>
            <a href="#">{title}</a>
          </h4>
        </div>
        <div className="col-xs-6 text-right">{headerExtra}</div>
        {accountTransfers.length === 0 && (
          <div className="col-xs-12">{emptyMessage}</div>
        )}
      </div>
      {accountTransfers.length > 0 && (
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
                      <Popover id="journalTransactionsTablePaidPopover">
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
                  <a href="#">GL Account</a>
                </th>
                <th>
                  <a href="#">Amount</a>
                </th>
                <th className="text-center">
                  <a href="#">Description</a>
                </th>
                <th>
                  <a href="#">Reference</a>
                </th>
                {!currentReportId && (
                  <th className="text-center">
                    <a href="#">Include into report</a>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {accountTransfers.map((r, index) => (
                <tr
                  key={r.paymentId}
                  className={classNames('noselect', {
                    active: index % 2 === 0,
                  })}
                >
                  <td>{r.firstName}</td>
                  <td>{r.lastName}</td>
                  <td>
                    <button
                      type="button"
                      className={classNames([
                        'btn btn-sm btn-bold text-center',
                        getBalanceClassName(
                          getRemainingBalance(r.registrationId),
                        ),
                      ])}
                      title="View/Edit Payments &amp; Expenses"
                      disabled={r.reportId !== null}
                      onClick={() => viewPayments(r.registrationId)}
                    >
                      <span className="currency-label">{currencySymbol}</span>
                    </button>
                    {r.error && (
                      <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="top"
                        overlay={
                          <Popover id="journalTransactionsTableErrorPopover">
                            {r.error}
                          </Popover>
                        }
                      >
                        <i className="error-popover fa fa-exclamation-triangle" />
                      </OverlayTrigger>
                    )}
                  </td>
                  <td>{r.businessUnit}</td>
                  <td>{r.operatingUnit}</td>
                  <td>{r.departmentId}</td>
                  <td>{r.projectId}</td>
                  <td>{r.glAccount}</td>
                  <td>{localizedCurrency(r.amount)}</td>
                  <td className="text-center">{r.description}</td>
                  <td>{r.account}</td>
                  <td className="text-center">
                    {!currentReportId && (
                      <input
                        type="checkbox"
                        checked={selectedAccountTransfers.has(r)}
                        onChange={(event) =>
                          setAccountTransferSelected(r, event.target.checked)
                        }
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
