import { act, renderHook } from '@testing-library/react-hooks';
import { Conference } from 'conference';
import { PromoReportService } from '../services/promoReportService';
import { usePromoReport } from './usePromoReport';

const conference = {
  id: 'conference-1',
  promotions: [{ id: 'promotion-1' }, { id: 'promotion-2' }],
} as Conference;

const loadPromoReport = jest.fn();
const promoReportService = {
  loadPromoReport,
} as unknown as PromoReportService;

const makePromise = () => {
  let resolver: (value: unknown) => void;
  const promise = new Promise((resolve) => {
    resolver = resolve;
  });
  // @ts-expect-error
  return { promise, resolve: resolver };
};

describe('usePromoReport', () => {
  it('initially reset', () => {
    const { result } = renderHook(() =>
      usePromoReport({
        conference,
        reportId: null,
        promoReportService,
      }),
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toBeNull();
    expect(result.current.promoRegistrations).toHaveLength(0);
  });

  it('loading state', () => {
    let reportId: string | null = null;
    loadPromoReport.mockReturnValue(new Promise(() => undefined));
    const { result, rerender } = renderHook(() =>
      usePromoReport({
        conference,
        reportId,
        promoReportService,
      }),
    );

    reportId = 'report-1';
    rerender();

    expect(result.current.loading).toBe(true);
    expect(result.current.report).toBeNull();
    expect(result.current.promoRegistrations).toHaveLength(0);
  });

  it('loaded state', async () => {
    let reportId: string | null = null;
    const report = {
      promotionRegistrationInfoList: [],
    };
    const loadPromise = Promise.resolve(report);
    loadPromoReport.mockReturnValue(loadPromise);
    const { result, rerender } = renderHook(() =>
      usePromoReport({
        conference,
        reportId,
        promoReportService,
      }),
    );

    reportId = 'report-1';
    rerender();
    await act(async () => {
      await loadPromise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toBe(report);
  });

  it('handles subsequent loads', async () => {
    let reportId: string | null = null;
    const { promise: loadPromise1, resolve: resolve1 } = makePromise();
    const { promise: loadPromise2, resolve: resolve2 } = makePromise();
    loadPromoReport.mockReturnValueOnce(loadPromise1);
    loadPromoReport.mockReturnValueOnce(loadPromise2);
    const { result, rerender } = renderHook(() =>
      usePromoReport({
        conference,
        reportId,
        promoReportService,
      }),
    );

    reportId = 'report-1';
    rerender();
    resolve1({ id: 'report-1', promotionRegistrationInfoList: [] });
    await act(async () => {
      await loadPromise1;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toMatchObject({ id: 'report-1' });

    reportId = 'report-2';
    rerender();
    resolve2({ id: 'report-2', promotionRegistrationInfoList: [] });
    await act(async () => {
      await loadPromise2;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toMatchObject({ id: 'report-2' });
  });

  it('handles concurrent loads', async () => {
    let reportId: string | null = null;
    const { promise: loadPromise1, resolve: resolve1 } = makePromise();
    const { promise: loadPromise2, resolve: resolve2 } = makePromise();
    loadPromoReport.mockReturnValueOnce(loadPromise1);
    loadPromoReport.mockReturnValueOnce(loadPromise2);
    const { result, rerender } = renderHook(() =>
      usePromoReport({
        conference,
        reportId,
        promoReportService,
      }),
    );

    reportId = 'report-1';
    rerender();

    reportId = 'report-2';
    rerender();

    expect(loadPromoReport).toHaveBeenCalledTimes(2);
    expect(result.current.loading).toBe(true);
    expect(result.current.report).toBeNull();

    resolve2({ id: 'report-2', promotionRegistrationInfoList: [] });
    await act(async () => {
      await loadPromise2;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toMatchObject({ id: 'report-2' });

    resolve1({ id: 'report-1', promotionRegistrationInfoList: [] });
    await act(async () => {
      await loadPromise1;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.report).toMatchObject({ id: 'report-2' });
  });

  it('refreshes the report', async () => {
    let reportId: string | null = null;
    const report = {
      promotionRegistrationInfoList: [
        {
          promotionId: 'promotion-1',
          registrationId: 'registration-1',
          error: '',
        },
        {
          promotionId: 'promotion-2',
          registrationId: 'registration-1',
          error: 'Error',
        },
      ],
      registrationList: [{ id: 'registration-1' }],
    };
    const loadPromise = Promise.resolve(report);
    loadPromoReport.mockReturnValue(loadPromise);
    const { result, rerender } = renderHook(() =>
      usePromoReport({
        conference,
        reportId,
        promoReportService,
      }),
    );

    reportId = 'report-1';
    rerender();
    await act(async () => {
      await loadPromise;
    });

    expect(loadPromoReport).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refresh();
      await loadPromise;
    });

    expect(loadPromoReport).toHaveBeenCalledTimes(2);
  });

  it('loads another report', async () => {
    let reportId: string | null = null;
    const report = {
      promotionRegistrationInfoList: [],
      registrationList: [],
    };
    const loadPromise = Promise.resolve(report);
    loadPromoReport.mockReturnValue(loadPromise);
    const { rerender } = renderHook(() =>
      usePromoReport({
        conference,
        reportId,
        promoReportService,
      }),
    );

    reportId = 'report-1';
    rerender();
    await act(async () => {
      await loadPromise;
    });

    expect(loadPromoReport).toHaveBeenCalledTimes(1);

    reportId = 'report-2';
    rerender();
    await act(async () => {
      await loadPromise;
    });

    expect(loadPromoReport).toHaveBeenCalledTimes(2);
  });

  it('removes the loaded report', async () => {
    let reportId: string | null = null;
    const report = {
      promotionRegistrationInfoList: [],
      registrationList: [],
    };
    const loadPromise = Promise.resolve(report);
    loadPromoReport.mockReturnValueOnce(loadPromise);
    const { result, rerender } = renderHook(() =>
      usePromoReport({
        conference,
        reportId,
        promoReportService,
      }),
    );

    reportId = 'report-1';
    rerender();
    await act(async () => {
      await loadPromise;
    });

    expect(result.current.report).toBe(report);

    reportId = null;
    rerender();

    expect(result.current.report).toBe(null);
  });

  it('calculates promo registrations', async () => {
    let reportId: string | null = null;
    const report = {
      promotionRegistrationInfoList: [
        {
          promotionId: 'promotion-1',
          registrationId: 'registration-1',
          error: '',
        },
        {
          promotionId: 'promotion-2',
          registrationId: 'registration-1',
          error: 'Error',
        },
      ],
      registrationList: [{ id: 'registration-1' }],
    };
    const loadPromise = Promise.resolve(report);
    loadPromoReport.mockReturnValueOnce(loadPromise);
    const { result, rerender } = renderHook(() =>
      usePromoReport({
        conference,
        reportId,
        promoReportService,
      }),
    );

    reportId = 'report-1';
    rerender();
    await act(async () => {
      await loadPromise;
    });

    expect(result.current.promoRegistrations).toEqual([
      {
        promotion: { id: 'promotion-1' },
        registration: { id: 'registration-1' },
        successfullyPosted: true,
        error: '',
      },
      {
        promotion: { id: 'promotion-2' },
        registration: { id: 'registration-1' },
        successfullyPosted: false,
        error: 'Error',
      },
    ]);
  });
});
