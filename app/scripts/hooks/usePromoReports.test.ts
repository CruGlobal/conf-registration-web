import { act, renderHook } from '@testing-library/react-hooks';
import { PromoReportService } from '../services/promoReportService';
import { usePromoReports } from './usePromoReports';

const conferenceId = 'conference-1';

const loadAllPromoReports = jest.fn();
const promoReportService = {
  loadAllPromoReports,
} as unknown as PromoReportService;

const makePromise = () => {
  let resolver: (value: unknown) => void;
  const promise = new Promise((resolve) => {
    resolver = resolve;
  });
  // @ts-expect-error
  return { promise, resolve: resolver };
};

describe('usePromoReports', () => {
  it('initial load', () => {
    loadAllPromoReports.mockReturnValue(new Promise(() => undefined));
    renderHook(() =>
      usePromoReports({
        conferenceId,
        promoReportService,
      }),
    );

    expect(loadAllPromoReports).toHaveBeenCalledTimes(1);
  });

  it('loading state', () => {
    loadAllPromoReports.mockReturnValue(new Promise(() => undefined));
    const { result } = renderHook(() =>
      usePromoReports({
        conferenceId,
        promoReportService,
      }),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.reports).toHaveLength(0);
  });

  it('loaded state', async () => {
    const reports = [{ id: 'report-1' }];
    const loadReport = Promise.resolve(reports);
    loadAllPromoReports.mockReturnValue(loadReport);
    const { result } = renderHook(() =>
      usePromoReports({
        conferenceId,
        promoReportService,
      }),
    );

    await act(async () => {
      await loadReport;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.reports).toBe(reports);
  });

  it('handles subsequent loads', async () => {
    let conferenceId = 'conference-1';
    const reports1 = [{ id: 'report-1' }];
    const reports2 = [{ id: 'report-2' }];
    const { promise: loadPromise1, resolve: resolve1 } = makePromise();
    const { promise: loadPromise2, resolve: resolve2 } = makePromise();
    loadAllPromoReports.mockReturnValueOnce(loadPromise1);
    loadAllPromoReports.mockReturnValueOnce(loadPromise2);
    const { result, rerender } = renderHook(() =>
      usePromoReports({
        conferenceId,
        promoReportService,
      }),
    );

    resolve1(reports1);
    await act(async () => {
      await loadPromise1;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.reports).toBe(reports1);

    conferenceId = 'conference-2';
    rerender();

    expect(result.current.loading).toBe(true);
    expect(result.current.reports).toBe(reports1);

    resolve2(reports2);
    await act(async () => {
      await loadPromise2;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.reports).toBe(reports2);
  });

  it('handles concurrent loads', async () => {
    let conferenceId = 'conference-1';
    const reports1 = [{ id: 'report-1' }];
    const reports2 = [{ id: 'report-2' }];
    const { promise: loadPromise1, resolve: resolve1 } = makePromise();
    const { promise: loadPromise2, resolve: resolve2 } = makePromise();
    loadAllPromoReports.mockReturnValueOnce(loadPromise1);
    loadAllPromoReports.mockReturnValueOnce(loadPromise2);
    const { result, rerender } = renderHook(() =>
      usePromoReports({
        conferenceId,
        promoReportService,
      }),
    );

    conferenceId = 'report-2';
    rerender();

    expect(loadAllPromoReports).toHaveBeenCalledTimes(2);

    resolve2(reports2);
    await act(async () => {
      await loadPromise2;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.reports).toBe(reports2);

    resolve1(reports1);
    await act(async () => {
      await loadPromise1;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.reports).toBe(reports2);
  });

  it('refreshes reports', async () => {
    const reports = [{ id: 'report-1' }];
    const loadPromise = Promise.resolve(reports);
    loadAllPromoReports.mockReturnValue(loadPromise);
    const { result } = renderHook(() =>
      usePromoReports({
        conferenceId,
        promoReportService,
      }),
    );

    expect(loadAllPromoReports).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refresh();
      await loadPromise;
    });

    expect(loadAllPromoReports).toHaveBeenCalledTimes(2);
  });
});
