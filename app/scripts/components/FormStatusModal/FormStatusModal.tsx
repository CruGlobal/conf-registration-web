import { useState } from 'react';
import angular, { IHttpService, ITimeoutService } from 'angular';
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
  $timeout: ITimeoutService;
}

const FormStatusModal = ({
  resolve,
  modalInstance,
  $http,
  $timeout,
}: FormStatusModalProps) => {
  const { registrant, registrantTypeName } = resolve;
  const [eformStatus, setEformStatus] = useState(registrant.eformStatus);
  const [alert, setAlert] = useState<{
    message: string;
    type: string;
  }>();
  const [loading, setLoading] = useState(false);

  const handleAlert = (message: string, type: string) => {
    setAlert({ message, type });
    $timeout(() => setAlert(undefined), 5000);
  };

  const handleClose = () => modalInstance.close({ ...registrant, eformStatus });

  const handleResend = () => {
    $http({
      method: 'PUT',
      url: `docusign/resend/${registrant.id}`,
    }).then(() => {
      handleAlert('Form successfully resent.', 'alert-success');
    });
  };

  const handleCheckStatus = () => {
    setLoading(true);
    $http
      .get(`docusign/status/${registrant.id}`)
      // @ts-ignore
      .then(({ data }: { data: RegistrantType }) => {
        const { eformStatus } = data;
        handleAlert('Status succesfully updated.', 'alert-success');
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
        <h4>Form Status</h4>
      </div>
      <div className="modal-body tab-content-spacing-above">
        <div className="row">
          <div className="col-sm-4">
            <label>Registrant Name:</label>
            <p>
              {registrant.firstName} {registrant.lastName}
            </p>
          </div>
          <div className="col-sm-5">
            <label>Registrant Email:</label>
            <p>{registrant.email}</p>
          </div>
          <div className="col-sm-3">
            <label>Registrant Type:</label>
            <p>{registrantTypeName}</p>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4">
            <label>Form Status:</label>
            <p>{eformStatus}</p>
          </div>
          <div className="col-sm-5">
            <label>Check Form Status:</label>
            <button className="btn btn-primary" onClick={handleCheckStatus}>
              Check Status
              {loading ? (
                <i className="fa fa-spinner fa-spin margin-left-10" />
              ) : null}
            </button>
          </div>
          <div className="col-sm-3">
            <label>Resend Form?</label>
            <button className="btn btn-primary" onClick={handleResend}>
              Resend
            </button>
          </div>
        </div>
        <hr />
        {alert ? (
          <div className={`alert ${alert.type}`}>{alert.message}</div>
        ) : null}

        <div className="form-group text-right">
          <button className="btn btn-success" onClick={handleClose}>
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
    react2angular(
      FormStatusModal,
      ['resolve', 'modalInstance'],
      ['$http', '$timeout'],
    ),
  );
