import { useMemo } from 'react';
import { Conference } from 'conference';
import { PromotionReport } from 'promotionReport';
import { PromoReportService } from '../services/promoReportService';
import { useQuery } from './useQuery';

export const usePromoReport = ({
  conference,
  reportId,
  promoReportService,
}: {
  conference: Conference;
  reportId: string | null;
  promoReportService: PromoReportService;
}): {
  // The loaded promo report, which will be null while it is being loaded
  report: PromotionReport | null;

  // Indicates whether the promo report is currently loading from the server
  loading: boolean;

  // Reload the promo report
  refresh: () => void;
} => {
  const {
    data: report,
    loading,
    refresh,
  } = useQuery({
    defaultData: null,
    enabled: reportId !== null,
    load: ([conferenceId, reportId]) =>
      promoReportService.loadPromoReport(conferenceId, reportId),
    variables: useMemo(
      () => [conference.id, reportId ?? ''] as const,
      [conference, reportId],
    ),
  });

  return { report, loading, refresh };
};
