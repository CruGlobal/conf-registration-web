import React from 'react';

export const FormStatusPopover = (): JSX.Element => {
  return (
    <div className="text-center">
      <button className="btn btn-danger btn-xs" style={{ margin: '0 2px' }}>
        Voided/Declined
      </button>
      <button className="btn btn-default btn-xs" style={{ margin: '0 2px' }}>
        Sent
      </button>
      <button className="btn btn-warning btn-xs" style={{ margin: '0 2px' }}>
        Delivered
      </button>
      <button className="btn btn-success btn-xs" style={{ margin: '0 2px' }}>
        Completed
      </button>
    </div>
  );
};
