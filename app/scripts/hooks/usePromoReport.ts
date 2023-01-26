import { find } from 'lodash';
import { useMemo } from 'react';
import { Conference } from 'conference';
import { PromoRegistration } from 'promoRegistration';
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

  // The promo registrations associated with the report
  promoRegistrations: Array<PromoRegistration>;

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

  return { report, promoRegistrations, loading, refresh };
};
