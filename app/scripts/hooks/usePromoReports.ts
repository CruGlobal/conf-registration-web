import { PromotionReport } from 'promotionReport';
import { useEffect, useRef, useState } from 'react';
import { PromoReportService } from '../services/promoReportService';

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
  const [reports, setReports] = useState<Array<PromotionReport>>([]);
  const [loading, setLoading] = useState(false);
  const activeRequest = useRef<Promise<Array<PromotionReport>> | null>(null);

  const refresh = () => {
    setLoading(true);

    // To avoid getting confused if there are multiple requests in progress, track the most recent
    // request and ignore the response if a request comes back that isn't the most recent request.
    const currentRequest = promoReportService.loadAllPromoReports(conferenceId);
    activeRequest.current = currentRequest;
    currentRequest.then((reports) => {
      if (activeRequest.current === currentRequest) {
        setReports(reports);
        setLoading(false);
      }
    });
  };

  // Load the reports initially and whenever the conference changes
  useEffect(() => {
    refresh();
  }, [conferenceId]);

  return {
    reports,
    refresh,
    loading,
  };
};
