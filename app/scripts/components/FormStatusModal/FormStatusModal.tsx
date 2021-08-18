import React, { useState } from 'react';
import angular, { IHttpService } from 'angular';
import { react2angular } from 'react2angular';

import { RegistrantType } from '../../../../types/registrant';

interface FormStatusModalProps {
  resolve: {
    registrant: RegistrantType;
    registrantTypeName: string;
  };
  modalInstance: {
    dismiss: () => void;
    close: (result?: RegistrantType) => void;
  };
  $http: IHttpService;
}

const FormStatusModal = ({
  resolve,
  modalInstance,
  $http,
}: FormStatusModalProps) => {
  const { registrant, registrantTypeName } = resolve;

  const [eformStatus, setEformStatus] = useState(registrant.eformStatus);

  const handleClose = () => modalInstance.dismiss();

  const handleResend = () => {
    $http({
      method: 'PUT',
      url: `docusign/resend/${registrant.id}`,
    });
  };

  const handleSave = () => {
    const updatedRegistrant = {
      ...registrant,
      eformStatus,
    };
    $http({
      method: 'PUT',
      url: `registrants/${registrant.id}`,
      data: updatedRegistrant,
    })
      .then(() => modalInstance.close(updatedRegistrant))
      .catch((error: Error) => {
        throw error;
      });
  };

  return (
    <>
      <div className="modal-header">
        <button
          type="button"
          className="close"
          onClick={handleClose}
          aria-hidden="true"
        >
          &times;
        </button>
        <h4 translate="yes">Form Staus</h4>
      </div>
      <div className="modal-body tab-content-spacing-above">
        <div className="row">
          <div className="col-sm-3">
            <label translate="yes">Registrant Name:</label>
            <p>
              {registrant.firstName} {registrant.lastName}
            </p>
          </div>
          <div className="col-sm-5">
            <label translate="yes">Registrant Email:</label>
            <p>{registrant.email}</p>
          </div>
          <div className="col-sm-3">
            <label translate="yes">Registrant Type:</label>
            <p>{registrantTypeName}</p>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-3">
            <label translate="yes">Form Status:</label>
            <select
              value={eformStatus}
              onChange={e => setEformStatus(e.target.value)}
              className="form-control"
            >
              <option value="sent" translate="yes">
                Sent
              </option>
              <option value="delivered" translate="yes">
                Delivered
              </option>
              <option value="completed" translate="yes">
                Completed
              </option>
              <option value="voided" translate="yes">
                Voided
              </option>
            </select>
          </div>
          <div className="col-sm-5">
            <label translate="yes">Last sent time:</label>
          </div>
          <div className="col-sm-3">
            <label translate="yes">Resend Form?</label>
            <button
              className="btn btn-primary"
              onClick={handleResend}
              translate="yes"
            >
              Resend
            </button>
          </div>
        </div>
        <hr />
        <div className="form-group text-right">
          <button
            className="btn btn-success"
            onClick={handleSave}
            translate="yes"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

angular
  .module('confRegistrationWebApp')
  .component(
    'formStatusModal',
    react2angular(FormStatusModal, ['resolve', 'modalInstance'], ['$http']),
  );
