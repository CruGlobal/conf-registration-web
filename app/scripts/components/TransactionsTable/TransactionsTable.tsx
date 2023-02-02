import { OverlayTrigger, Popover } from 'react-bootstrap';
import { AccountTransfer } from 'accountTransfer';
import { PromoRegistration } from 'promoRegistration';
import { RegistrationsPaidPopover } from '../RegistrationsPaidPopover/RegistrationsPaidPopover';

export interface BaseTransactionRow {
  id: string;
  registrationId: string;
  firstName: string;
  lastName: string;
  remainingBalance: number;
  error?: string | null;
  businessUnit: string | null;
  operatingUnit: string | null;
  departmentId: string | null;
  projectId: string | null;
  amount: number;
  description: string;
}

export interface AccountTransferRow extends BaseTransactionRow {
  type: 'accountTransfer';
  glAccount: string;
  account: string | null;
  transaction: AccountTransfer;
}

export interface PromotionRow extends BaseTransactionRow {
  type: 'promotion';
  transaction: PromoRegistration;
}

export type RowTypes = {
  accountTransfer: AccountTransferRow;
  promotion: PromotionRow;
};

export interface TransactionsTableProps<RowType extends keyof RowTypes> {
  // The type of the rows (account transfer or promotion)
  rowType: RowType;

  // The rows to display in the table
  rows: Array<RowTypes[RowType]>;

  // The id of the report that is currently being viewed, if any
  currentReportId: string | null;

  // The localized currency symbol
  currencySymbol: string;

  // Message to display when there aren't any transactions
  emptyMessage?: string;

  // Extra content to display in the table header
  headerExtra?: React.ReactFragment;

  // Convert a currency amount to a localized string
  localizedCurrency: (amount: number) => string;

  // Whether rows in the table can be selected
  selectable: boolean;

  // The set of transactions that are selected and will be included in a new report
  selectedTransactions: Set<RowTypes[RowType]['transaction']>;

  // Handle changes to the selected state of a transaction
  setTransactionSelected: (
    transaction: RowTypes[RowType]['transaction'],
    selected: boolean,
  ) => void;

  // The title of the transactions table
  title: string;

  // Open the view payments modal
  viewPayments: (registrationId: string) => void;
}

const getBalanceClassName = (balance: number): string => {
  if (balance === 0) {
    return 'btn-success';
  } else if (balance < 0) {
    return 'btn-danger';
  } else {
    return 'btn-default';
  }
};

export const TransactionsTable = <RowType extends keyof RowTypes>({
  currentReportId,
  currencySymbol,
  emptyMessage,
  headerExtra,
  localizedCurrency,
  rows,
  rowType,
  selectable,
  selectedTransactions,
  setTransactionSelected,
  title,
  viewPayments,
}: TransactionsTableProps<RowType>): JSX.Element => {
  return (
    <div className="row form-group">
      <div>
        <div className="col-xs-6 details-heading">
          <h4>
            <a href="#">{title}</a>
          </h4>
        </div>
        <div className="col-xs-6 text-right">{headerExtra}</div>
        {rows.length === 0 && <div className="col-xs-12">{emptyMessage}</div>}
      </div>
      {rows.length > 0 && (
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
                  <span className="margin-right-xs">Paid</span>
                  <OverlayTrigger
                    trigger={['hover', 'focus']}
                    placement="top"
                    overlay={
                      <Popover id="TransactionsTablePaidPopover">
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
                {rowType === 'accountTransfer' && (
                  <th>
                    <a href="#">GL Account</a>
                  </th>
                )}
                <th>
                  <a href="#">Amount</a>
                </th>
                <th className="text-center">
                  <a href="#">Description</a>
                </th>
                {rowType === 'accountTransfer' && (
                  <th>
                    <a href="#">Reference</a>
                  </th>
                )}
                {selectable && (
                  <th className="text-center">
                    <a href="#">Include into report</a>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={'noselect ' + (index % 2 === 0 ? 'active' : '')}
                >
                  <td>{row.firstName}</td>
                  <td>{row.lastName}</td>
                  <td>
                    <button
                      type="button"
                      className={
                        'btn btn-sm btn-bold text-center ' +
                        getBalanceClassName(row.remainingBalance)
                      }
                      title="View/Edit Payments &amp; Expenses"
                      disabled={currentReportId !== null}
                      onClick={() => viewPayments(row.registrationId)}
                    >
                      <span className="currency-label">{currencySymbol}</span>
                    </button>
                    {row.error && (
                      <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="top"
                        overlay={
                          <Popover id="TransactionsTableErrorPopover">
                            {row.error}
                          </Popover>
                        }
                      >
                        <i
                          className="error-popover fa fa-exclamation-triangle"
                          data-testid="transactions-table-error-popover"
                        />
                      </OverlayTrigger>
                    )}
                  </td>
                  <td>{row.businessUnit}</td>
                  <td>{row.operatingUnit}</td>
                  <td>{row.departmentId}</td>
                  <td>{row.projectId}</td>
                  {row.type === 'accountTransfer' && <td>{row.glAccount}</td>}
                  <td>{localizedCurrency(row.amount)}</td>
                  <td className="text-center">{row.description}</td>
                  {row.type === 'accountTransfer' && <td>{row.account}</td>}
                  {selectable && (
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(row.transaction)}
                        onChange={(event) =>
                          setTransactionSelected(
                            row.transaction,
                            event.target.checked,
                          )
                        }
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
