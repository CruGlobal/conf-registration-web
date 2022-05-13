import { useState } from 'react';
import angular from 'angular';
import { react2angular } from 'react2angular';

interface ExportModalProps {
  resolve: {
    conference: any;
    queryParameters: any;
  };
  envService: any;
  $cookies: {
    get(key: string): string;
  };
  modalInstance: {
    dismiss: () => void;
  };
}

enum AccountTransferExportEnum {
  REGISTRATION = 'REGISTRATION',
  MISCELLANEOUS_ITEM = 'MISCELLANEOUS_ITEM',
  CHILDCARE = 'CHILDCARE',
  STAFF_TAXABLE_ITEM = 'STAFF_TAXABLE_ITEM',
}

const ExportModal = ({
  resolve,
  modalInstance,
  $cookies,
  envService,
}: ExportModalProps) => {
  const { conference, queryParameters } = resolve;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [includeFilters, setIncludeFilters] = useState(false);
  const [includeWithdrawnRegistrants, setIncludeWithdrawnRegistrants] =
    useState(false);
  const [includeIncompleteRegistrations, setIncludeIncompleteRegistrations] =
    useState(false);
  const [expenseType, setExpenseType] = useState(
    AccountTransferExportEnum.REGISTRATION,
  );
  const apiUrl = envService.read('apiUrl');
  const authToken = $cookies.get('crsToken');

  const handleClose = () => modalInstance.dismiss();

  let exportParameters = `Authorization=${authToken}&includeWithdrawn=${
    includeWithdrawnRegistrants ? 'yes' : 'no'
  }&includeIncomplete=${includeIncompleteRegistrations ? 'yes' : 'no'}`;
  const filterString = `&applyUiFilters=true&filter=${encodeURIComponent(
    queryParameters.filter,
  )}&filterPayment=${queryParameters.filterPayment}&filterRegType=${
    queryParameters.filterRegType
  }&includeCheckedin=${queryParameters.includeCheckedin}&includeEFormStatus=${
    queryParameters.includeEFormStatus
  }&includeIncomplete=${queryParameters.includeIncomplete}&includeWithdrawn=${
    queryParameters.includeWithdrawn
  }&order=${queryParameters.order}&orderBy=${queryParameters.orderBy}`;
  if (includeFilters) {
    exportParameters += filterString;
  }
  angular.forEach(queryParameters.block, (blockId) => {
    exportParameters += `&block=${blockId}`;
  });

  return (
    <>
      <div className="modal-header">
        <button type="button" className="close" onClick={handleClose}>
          &times;
        </button>
        <h3>
          <span translate="yes">Export</span> - {conference.name}
        </h3>
      </div>

      <div className="modal-body">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-8">
              <strong translate="yes">Registrations</strong>
              <br />
              <p translate="yes">Registrations and answers</p>
              <br />
              <a onClick={() => setShowAdvanced((prev) => !prev)}>
                {showAdvanced ? 'Hide' : 'Show'} advanced options
              </a>
              {showAdvanced ? (
                <div>
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => setIncludeFilters((prev) => !prev)}
                        checked={includeFilters}
                      />
                      <span translate="yes">
                        Apply current filters to export{' '}
                        <em>(overrides other advanced options)</em>
                      </span>
                    </label>
                  </div>
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        onChange={() =>
                          setIncludeWithdrawnRegistrants((prev) => !prev)
                        }
                        checked={includeWithdrawnRegistrants}
                      />
                      <span translate="yes">Include withdrawn registrants</span>
                    </label>
                  </div>
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        onChange={() =>
                          setIncludeIncompleteRegistrations((prev) => !prev)
                        }
                        checked={includeIncompleteRegistrations}
                      />
                      <span translate="yes">
                        Include incomplete registrations
                      </span>
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="col-xs-4">
              <a
                className="btn btn-primary btn-block"
                href={`${apiUrl}conferences/${conference.id}/export/registrations?${exportParameters}`}
              >
                <i className="fa fa-cloud-download" />{' '}
                <span translate="yes">Download</span>
              </a>
            </div>
          </div>
          <hr />
          <div className="row spacing-above-sm">
            <div className="col-xs-8">
              <strong translate="yes">Payments</strong>
              <br />
              <p translate="yes">Payment data and history</p>
            </div>
            <div className="col-xs-4">
              <a
                className="btn btn-primary btn-block"
                href={`${apiUrl}conferences/${conference.id}/export/payments?Authorization=${authToken}`}
              >
                <i className="fa fa-cloud-download" />{' '}
                <span translate="yes">Download</span>
              </a>
            </div>
          </div>
          <hr />
          <div className="row spacing-above-sm">
            <div className="col-xs-8">
              <strong translate="yes">Account Transfers</strong>
              <br />
              <span translate="yes">Staff Account Transfer payments</span>
              <br />
              <div className="panel">
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      onChange={() =>
                        setExpenseType(AccountTransferExportEnum.REGISTRATION)
                      }
                      checked={
                        expenseType === AccountTransferExportEnum.REGISTRATION
                      }
                      value={AccountTransferExportEnum.REGISTRATION}
                    />
                    <span translate="yes">Registrations</span>
                  </label>
                </div>
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      onChange={() =>
                        setExpenseType(
                          AccountTransferExportEnum.MISCELLANEOUS_ITEM,
                        )
                      }
                      checked={
                        expenseType ===
                        AccountTransferExportEnum.MISCELLANEOUS_ITEM
                      }
                      value={AccountTransferExportEnum.MISCELLANEOUS_ITEM}
                    />
                    <span translate="yes">Misc. Item</span>
                  </label>
                </div>
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      onChange={() =>
                        setExpenseType(AccountTransferExportEnum.CHILDCARE)
                      }
                      checked={
                        expenseType === AccountTransferExportEnum.CHILDCARE
                      }
                      value={AccountTransferExportEnum.CHILDCARE}
                    />
                    <span translate="yes">Childcare</span>
                  </label>
                </div>
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      onChange={() =>
                        setExpenseType(
                          AccountTransferExportEnum.STAFF_TAXABLE_ITEM,
                        )
                      }
                      checked={
                        expenseType ===
                        AccountTransferExportEnum.STAFF_TAXABLE_ITEM
                      }
                      value={AccountTransferExportEnum.STAFF_TAXABLE_ITEM}
                    />
                    <span translate="yes">Staff Taxable Items</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="col-xs-4">
              <a
                className="btn btn-primary btn-block"
                href={`${apiUrl}conferences/${conference.id}/export/transfers?Authorization=${authToken}&expenseType=${expenseType}`}
              >
                <i className="fa fa-cloud-download" />{' '}
                <span translate="yes">Download</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button
          onClick={handleClose}
          className="btn btn-default"
          translate="yes"
        >
          Cancel
        </button>
      </div>
    </>
  );
};

angular
  .module('confRegistrationWebApp')
  .component(
    'exportModal',
    react2angular(
      ExportModal,
      ['resolve', 'modalInstance'],
      ['$cookies', 'envService'],
    ),
  );
