import React from 'react';

export const RegistrationsPaidPopover = (): JSX.Element => {
  return (
    <div className="paid-popover">
      <button className="btn btn-default btn-xs">Balance Due</button>
      <button className="btn btn-success btn-xs">Paid in Full</button>
      <button className="btn btn-danger btn-xs">Overpaid</button>
    </div>
  );
};
