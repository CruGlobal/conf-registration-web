import { act, renderHook } from '@testing-library/react-hooks';
import { conference, promoReport as report } from '../../../__tests__/fixtures';
import { PromoReportService } from '../services/promoReportService';
import { usePromoReport } from './usePromoReport';

const loadPromoReport = jest.fn();
const promoReportService = {
  loadPromoReport,
} as unknown as PromoReportService;

describe('usePromoReport', () => {
  it('loads reports', async () => {
    const loadPromise = Promise.resolve(report);
    loadPromoReport.mockResolvedValue(loadPromise);
    const { result } = renderHook(() =>
      usePromoReport({
        conference,
        reportId: report.id,
        promoReportService,
      }),
    );

    await act(async () => {
      await loadPromise;
    });

    expect(loadPromoReport).toHaveBeenCalledTimes(1);
    expect(result.current.report).toBe(report);
  });
});
