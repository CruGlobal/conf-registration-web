import angular from 'angular';
import React, { ReactElement } from 'react';
import { react2angular } from 'react2angular';

export const FormStatusPopover = (): ReactElement => {
  return (
    <div>
      <button
        className="btn btn-default btn-xs"
        style={{ margin: '0 2px' }}
        translate="yes"
      >
        Sent
      </button>
      <button
        className="btn btn-warning btn-xs"
        style={{ margin: '0 2px' }}
        translate="yes"
      >
        Recieved
      </button>
      <button
        className="btn btn-success btn-xs"
        style={{ margin: '0 2px' }}
        translate="yes"
      >
        Complete
      </button>
    </div>
  );
};

angular
  .module('confRegistrationWebApp')
  .component('formStatusPopover', react2angular(FormStatusPopover, []));
