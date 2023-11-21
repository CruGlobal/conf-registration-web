import { act, renderHook } from '@testing-library/react-hooks';
import { conference, promoReport } from '../../../__tests__/fixtures';
import { PromoReportService } from '../services/promoReportService';
import { usePromoReports } from './usePromoReports';

describe('usePromoReports', () => {
  it('loads reports', async () => {
    const reports = [promoReport];
    const loadPromise = Promise.resolve(reports);
    const loadAllPromoReports = jest.fn(() => loadPromise);
    const promoReportService = {
      loadAllPromoReports,
    } as unknown as PromoReportService;

    const { result } = renderHook(() =>
      usePromoReports({
        conferenceId: conference.id,
        promoReportService,
      }),
    );

    await act(async () => {
      await loadPromise;
    });

    expect(loadAllPromoReports).toHaveBeenCalledTimes(1);
    expect(result.current.reports).toBe(reports);
  });
});
