import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { conference } from '../../../../__tests__/fixtures';
import { UploadPageHeader, UploadPageHeaderProps } from './UploadPageHeader';

describe('UploadPageHeader component', () => {
  const handleSubmit = jest.fn();
  const setCurrentReportId = jest.fn();
  const props: UploadPageHeaderProps = {
    conference,
    currentReportId: null,
    handleSubmit,
    reports: [
      { id: 'report-1', transactionTimestamp: '2022-01-01 12:00:00' },
      { id: 'report-2', transactionTimestamp: '2022-01-02 12:00:00' },
    ],
    setCurrentReportId,
    submitEnabled: true,
    uploadType: 'Journal',
  };

  it('renders conference info', () => {
    const { getByText } = render(<UploadPageHeader {...props} />);

    expect(getByText('Test Conference')).toBeInTheDocument();
    expect(getByText('conference-1')).toBeInTheDocument();
    expect(
      getByText('Conference Admin, 123-456-7890, conference.admin@cru.org'),
    ).toBeInTheDocument();
  });

  it('enables and disables submit button', () => {
    let submitEnabled = true;
    const { getByRole, rerender } = render(
      <UploadPageHeader {...props} submitEnabled={submitEnabled} />,
    );

    expect(
      getByRole('button', { name: 'Submit Journal Upload' }),
    ).toBeEnabled();

    submitEnabled = false;
    rerender(<UploadPageHeader {...props} submitEnabled={submitEnabled} />);

    expect(
      getByRole('button', { name: 'Submit Journal Upload' }),
    ).not.toBeEnabled();
  });

  it('changes the report', () => {
    let currentReportId = 'report-1';
    const { getByRole, rerender } = render(
      <UploadPageHeader {...props} currentReportId={currentReportId} />,
    );

    expect(
      getByRole('combobox', { name: 'Report creation date:' }),
    ).toHaveValue('report-1');

    currentReportId = 'report-2';
    rerender(<UploadPageHeader {...props} currentReportId={currentReportId} />);

    expect(
      getByRole('combobox', { name: 'Report creation date:' }),
    ).toHaveValue('report-2');
  });

  it('calls setCurrentReportId', async () => {
    const { getByRole } = render(<UploadPageHeader {...props} />);

    await act(async () => {
      await userEvent.selectOptions(
        getByRole('combobox', { name: 'Report creation date:' }),
        '2022-01-02 12:00:00',
      );
    });

    expect(setCurrentReportId).toHaveBeenCalledWith('report-2');
  });

  it('calls setCurrentReportId with null', async () => {
    const { getByRole } = render(<UploadPageHeader {...props} />);

    await act(async () => {
      const combobox = getByRole('combobox', { name: 'Report creation date:' });
      await userEvent.selectOptions(combobox, '2022-01-02 12:00:00');
      setCurrentReportId.mockClear();
      await userEvent.selectOptions(combobox, 'New Report');
    });

    expect(setCurrentReportId).toHaveBeenCalledWith(null);
  });

  it('calls submit', async () => {
    const { getByRole } = render(<UploadPageHeader {...props} />);

    await act(async () => {
      await userEvent.click(
        getByRole('button', { name: 'Submit Journal Upload' }),
      );
    });

    expect(handleSubmit).toHaveBeenCalledWith();
  });
});
