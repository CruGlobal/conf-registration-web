import { Conference } from 'conference';
import { find } from 'lodash';
import { PromotionReport } from 'promotionReport';
import { useEffect, useMemo, useState } from 'react';
import { PromoReportService } from '../services/promoReportService';
import { PromoRegistration } from './usePromoRegistrationList';

let activeRequest: Promise<PromotionReport> | null = null;

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

  // The promo registrations associated with the report
  promoRegistrations: Array<PromoRegistration>;

  // Indicates whether the promo report is currently loading from the server
  loading: boolean;

  // Reload the promo report
  refresh: () => void;
} => {
  const [report, setReport] = useState<PromotionReport | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setReport(null);
    setLoading(true);

    if (reportId === null) {
      // If the report is null, don't load and keep the report null
      setLoading(false);
      activeRequest = null;
    } else {
      // To avoid getting confused if there are multiple requests in progress, track the most recent
      // request and ignore the response if a request comes back that isn't the most recent request.
      const currentRequest = promoReportService.loadPromoReport(
        conference.id,
        reportId,
      );
      activeRequest = currentRequest;
      currentRequest.then((report) => {
        if (activeRequest === currentRequest) {
          setReport(report);
          setLoading(false);
        }
      });
    }
  };

  // Load the reports initially and whenever the conference changes
  useEffect(() => {
    refresh();
  }, [conference, reportId]);

  const promoRegistrations = useMemo(
    () =>
      report?.promotionRegistrationInfoList.map(
        ({ promotionId, registrationId, error }) => {
          const promotion = find(conference.promotions, {
            id: promotionId,
          });
          if (!promotion) {
            throw new Error(`Couldn't find promotion with id ${promotionId}`);
          }

          const registration = find(report.registrationList, {
            id: registrationId,
          });
          if (!registration) {
            throw new Error(
              `Couldn't find registration with id ${registrationId}`,
            );
          }

          return {
            promotion,
            registration,
            successfullyPosted: !error,
            error,
          };
        },
      ) ?? [],
    [report],
  );

  return {
    report,
    promoRegistrations,
    refresh,
    loading,
  };
};
