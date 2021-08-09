import React from 'react';
import angular from 'angular';
import { react2angular } from 'react2angular';

import { RegistrantType } from '../../../../types/registrant';

interface FormStatusModalProps {
  resolve: {
    registrant: RegistrantType;
    registrantTypeName: string;
  };
  modalInstance: {
    close: (result?: any) => void;
  };
}

const FormStatusModal = ({ resolve, modalInstance }: FormStatusModalProps) => {
  const { registrant, registrantTypeName } = resolve;

  const handleClose = () => modalInstance.close();

  const handleResend = () => modalInstance.close();

  const handleSave = () => modalInstance.close();
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
            <select ng-model="registrant.eformStatus" className="form-control">
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
    react2angular(FormStatusModal, ['resolve', 'modalInstance'], []),
  );
