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
  const [loading, setLoading] = useState(false);

  const handleClose = () => modalInstance.close({ ...registrant, eformStatus });

  const handleResend = () => {
    $http({
      method: 'PUT',
      url: `docusign/resend/${registrant.id}`,
    });
  };

  const handleCheckStatus = () => {
    setLoading(true);
    $http
      .get(`docusign/status/${registrant.id}`)
      // @ts-ignore
      .then(({ data }: { data: RegistrantType }) => {
        const { eformStatus } = data;
        setLoading(false);
        setEformStatus(eformStatus);
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
          <div className="col-sm-4">
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
          <div className="col-sm-4">
            <label translate="yes">Form Status:</label>
            <p>{eformStatus}</p>
          </div>
          <div className="col-sm-5">
            <label translate="yes">Check Form Status:</label>
            <button
              className="btn btn-primary"
              onClick={handleCheckStatus}
              translate="yes"
            >
              Check Status
              {loading ? (
                <i className="fa fa-spinner fa-spin margin-left-10" />
              ) : null}
            </button>
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
            onClick={handleClose}
            translate="yes"
          >
            Close
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
