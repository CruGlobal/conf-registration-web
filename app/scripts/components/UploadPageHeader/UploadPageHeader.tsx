import React, { FunctionComponent } from 'react';
import { Conference } from 'conference';

export interface UploadPageHeaderProps {
  conference: Conference;
  currentReportId: string | null;
  handleSubmit: () => unknown;
  reports: Array<{ id: string; transactionTimestamp: string }>;
  setCurrentReportId: (newReportId: string | null) => void;
  submitEnabled: boolean;
  uploadType: 'Journal' | 'Promo';
}

// The header portion of a journal upload or promo upload page
export const UploadPageHeader: FunctionComponent<UploadPageHeaderProps> = ({
  conference,
  currentReportId,
  handleSubmit,
  reports,
  setCurrentReportId,
  submitEnabled,
  uploadType,
}: UploadPageHeaderProps) => {
  return (
    <>
      <div className="row form-group">
        <div className="col-sm-7">
          <h2 className="page-title">ERT {uploadType} Upload Submission</h2>
        </div>
        <div className="col-sm-5 text-right">
          <button
            className="btn btn-success btn-md"
            type="button"
            onClick={() => handleSubmit()}
            disabled={!submitEnabled}
          >
            Submit {uploadType} Upload
          </button>
        </div>
      </div>
      <div className="row form-group">
        <div className="col-xs-6 col-sm-2 details-heading">
          Conference Long Name:
        </div>
        <div className="col-xs-6 col-sm-3 details-heading">
          {conference.name}
        </div>
      </div>
      <div className="row form-group">
        <div className="col-xs-6 col-sm-2 details-heading">Conference ID:</div>
        <div className="col-xs-6 col-sm-3 details-heading">{conference.id}</div>
      </div>
      <div className="row form-group">
        <div className="col-xs-6 col-sm-2 details-heading">
          Conference Contact:
        </div>
        <div className="col-xs-6 col-sm-3 details-heading">
          {[
            conference.contactPersonName,
            conference.contactPersonPhone,
            conference.contactPersonEmail,
          ].join(', ')}
        </div>
      </div>
      <div className="row form-group">
        <div className="col-xs-6 col-sm-2 details-heading">
          <label htmlFor="report-select-id">Report creation date:</label>
        </div>
        <div className="col-xs-6 col-sm-3 details-heading">
          <select
            className="form-control"
            id="report-select-id"
            value={currentReportId ?? ''}
            onChange={(event) => setCurrentReportId(event.target.value || null)}
          >
            <option value="">New Report</option>
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.transactionTimestamp}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};
