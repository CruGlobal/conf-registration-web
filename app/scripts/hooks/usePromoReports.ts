import { PromotionReport } from 'promotionReport';
import { PromoReportService } from '../services/promoReportService';
import { useQuery } from './useQuery';

export const usePromoReports = ({
  conferenceId,
  promoReportService,
}: {
  conferenceId: string;
  promoReportService: PromoReportService;
}): {
  // The list of loaded promo reports, which will be empty while they are being loaded
  reports: Array<PromotionReport>;

  // Indicates whether the promo reports are currently loading from the server
  loading: boolean;

  // Reload the list of promo reports
  refresh: () => void;
} => {
  const {
    data: reports,
    loading,
    refresh,
  } = useQuery({
    defaultData: [] as PromotionReport[],
    load: (conferenceId) =>
      promoReportService.loadAllPromoReports(conferenceId),
    variables: conferenceId,
  });

  return { reports, loading, refresh };
};
