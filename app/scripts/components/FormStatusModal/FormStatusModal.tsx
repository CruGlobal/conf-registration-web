import React from 'react';
import angular from 'angular';
import { react2angular } from 'react2angular';

import { RegistrantType } from '../../../../types/registrant';

interface FormStatusModalProps {
  resolve: {
    registrant: RegistrantType;
  };
  modalInstance: {
    close: (result?: any) => void;
  };
}

const FormStatusModal = ({ resolve, modalInstance }: FormStatusModalProps) => {
  const { registrant } = resolve;

  const handleClose = () => modalInstance.close();

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
        <h4>Form Staus</h4>
      </div>
      <div className="modal-body tab-content-spacing-above">
        <p>Form info for {registrant.firstName} will go here</p>
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
